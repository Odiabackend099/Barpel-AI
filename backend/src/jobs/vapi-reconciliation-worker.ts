/**
 * BullMQ Worker for Vapi Call Reconciliation
 *
 * Schedules and processes daily Vapi reconciliation jobs.
 * Runs at 3 AM UTC every day via cron expression.
 *
 * Follows the same lazy-initialization pattern as wallet-queue.ts and
 * webhook-queue.ts: queue and worker are null until
 * initializeVapiReconciliationWorker() is called from server.ts.
 * If Redis is unavailable the module no-ops cleanly — no crash loop.
 */

import { Queue, Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import { reconcileVapiCalls } from './vapi-reconciliation';
import { createLogger } from '../services/logger';

const logger = createLogger('VapiReconciliationWorker');

// Lazily initialized — null until initializeVapiReconciliationWorker() is called
export let vapiReconcileQueue: Queue | null = null;
let vapiReconcileWorker: Worker | null = null;

/**
 * Initialize the Vapi reconciliation queue and worker.
 * No-op if Redis is unavailable (matches wallet-queue.ts / webhook-queue.ts pattern).
 * Called from server.ts alongside all other initialize*() calls.
 */
export function initializeVapiReconciliationWorker(): void {
  // BullMQ Queue and Worker each require a separate ioredis connection
  const queueConn = createRedisConnection();
  if (!queueConn) {
    logger.warn('Redis not available — Vapi reconciliation worker disabled');
    return;
  }

  const workerConn = createRedisConnection();
  if (!workerConn) {
    logger.warn('Redis not available — Vapi reconciliation worker disabled');
    queueConn.quit().catch(() => {});
    return;
  }

  vapiReconcileQueue = new Queue('vapi-reconcile', {
    connection: queueConn,
    defaultJobOptions: {
      removeOnComplete: { age: 7 * 24 * 60 * 60, count: 100 },
      removeOnFail:    { age: 30 * 24 * 60 * 60, count: 200 }
    }
  });

  vapiReconcileWorker = new Worker(
    'vapi-reconcile',
    async (job) => {
      logger.info('Starting Vapi reconciliation job', {
        jobId: job.id,
        scheduledAt: new Date().toISOString()
      });

      try {
        const result = await reconcileVapiCalls();
        logger.info('Vapi reconciliation job completed successfully', { jobId: job.id, result });
        return result;
      } catch (error) {
        logger.error('Vapi reconciliation job failed', {
          jobId: job.id,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error; // BullMQ will retry
      }
    },
    { connection: workerConn, concurrency: 1 }
  );

  vapiReconcileWorker.on('completed', (job, result) => {
    logger.info('Vapi reconciliation job completed', {
      jobId: job.id,
      totalChecked: result.totalChecked,
      recovered: result.recovered,
      webhookReliability: `${result.webhookReliability.toFixed(2)}%`
    });
  });

  vapiReconcileWorker.on('failed', (job, error) => {
    logger.error('Vapi reconciliation job failed', {
      jobId: job?.id,
      error: error.message,
      attempts: job?.attemptsMade
    });
  });

  vapiReconcileWorker.on('error', (error) => {
    logger.error('Vapi reconciliation worker error', { error: error.message });
  });

  logger.info('Vapi reconciliation worker initialized');
}

/**
 * Schedule daily reconciliation at 3 AM UTC.
 * No-op (with warning) if the queue was not initialized (Redis unavailable).
 */
export async function scheduleVapiReconciliation(): Promise<void> {
  if (!vapiReconcileQueue) {
    logger.warn('Vapi reconciliation queue not initialized (Redis unavailable) — skipping schedule');
    return;
  }

  try {
    // Remove any existing repeatable jobs to avoid duplicates on restart
    const repeatableJobs = await vapiReconcileQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await vapiReconcileQueue.removeRepeatableByKey(job.key);
    }

    await vapiReconcileQueue.add(
      'daily-reconcile',
      {},
      {
        repeat:  { pattern: '0 3 * * *', tz: 'UTC' },
        jobId:   'daily-vapi-reconcile',
        removeOnComplete: { age: 7 * 24 * 60 * 60, count: 100 },
        removeOnFail:     { age: 30 * 24 * 60 * 60, count: 200 }
      }
    );

    logger.info('Vapi reconciliation scheduled successfully', {
      schedule: '3 AM UTC daily',
      pattern: '0 3 * * *'
    });
  } catch (error) {
    logger.error('Failed to schedule Vapi reconciliation', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Manual trigger for reconciliation (for testing/emergency).
 * Throws if Redis is unavailable so callers can surface a clear error.
 */
export async function triggerManualReconciliation(): Promise<void> {
  if (!vapiReconcileQueue) {
    throw new Error('Reconciliation queue not available — Redis not connected');
  }

  try {
    const job = await vapiReconcileQueue.add('manual-reconcile', {
      triggered: 'manual',
      timestamp: new Date().toISOString()
    });
    logger.info('Manual Vapi reconciliation triggered', { jobId: job.id });
  } catch (error) {
    logger.error('Failed to trigger manual reconciliation', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Get reconciliation job status and history.
 * Returns { available: false } shape when Redis is unavailable.
 */
export async function getReconciliationStatus() {
  if (!vapiReconcileQueue) {
    return {
      available: false,
      completed: 0,
      failed:    0,
      delayed:   0,
      waiting:   0,
      active:    0,
      lastCompleted: null,
      lastFailed:    null
    };
  }

  const [completed, failed, delayed, waiting, active] = await Promise.all([
    vapiReconcileQueue.getCompleted(0, 9),
    vapiReconcileQueue.getFailed(0, 9),
    vapiReconcileQueue.getDelayed(0, 9),
    vapiReconcileQueue.getWaiting(0, 9),
    vapiReconcileQueue.getActive(0, 9)
  ]);

  return {
    available: true,
    completed: completed.length,
    failed:    failed.length,
    delayed:   delayed.length,
    waiting:   waiting.length,
    active:    active.length,
    lastCompleted: completed[0] ? {
      id:          completed[0].id,
      timestamp:   completed[0].timestamp,
      result:      completed[0].returnvalue
    } : null,
    lastFailed: failed[0] ? {
      id:        failed[0].id,
      timestamp: failed[0].timestamp,
      error:     failed[0].failedReason
    } : null
  };
}

/**
 * Graceful shutdown — null-safe.
 */
export async function shutdownReconciliationWorker(): Promise<void> {
  logger.info('Shutting down Vapi reconciliation worker...');

  if (vapiReconcileWorker) {
    await vapiReconcileWorker.close();
    vapiReconcileWorker = null;
  }

  if (vapiReconcileQueue) {
    await vapiReconcileQueue.close();
    vapiReconcileQueue = null;
  }

  logger.info('Vapi reconciliation worker shut down successfully');
}
