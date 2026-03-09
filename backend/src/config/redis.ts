import Redis, { RedisOptions } from 'ioredis';
import { log } from '../services/logger';
import { isCircuitOpen, recordFailure, recordSuccess } from '../services/safe-call';
import { sendSlackAlert } from '../services/slack-alerts';

let redisClient: Redis | null = null;
const connections: Redis[] = [];

function safeHostname(url: string): string {
  try { return new URL(url).hostname; }
  catch { return 'unknown'; }
}

function buildRedisOptions(redisUrl: string): RedisOptions {
  const useTls = redisUrl.startsWith('rediss://');
  return {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    family: 0, // Allow both IPv4 and IPv6 resolution
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    retryStrategy: (times: number) => {
      if (times > 10) {
        log.error('Redis', 'Max connection retries (10) exceeded — giving up. Check REDIS_URL.');
        return null;
      }
      if (isCircuitOpen('Redis')) {
        log.warn('Redis', 'Circuit breaker open — stopping retry attempts');
        return null;
      }
      return Math.min(times * 200, 3000);
    },
  };
}

function attachErrorHandler(conn: Redis, redisUrl: string): void {
  conn.on('error', (err) => {
    const isAuthError =
      err.message.includes('WRONGPASS') ||
      err.message.includes('NOAUTH') ||
      err.message.includes('invalid username-password');

    if (isAuthError) {
      log.error('Redis', 'AUTHENTICATION FAILED — check REDIS_URL credentials', {
        host: safeHostname(redisUrl),
        error: err.message,
        action: 'Update REDIS_URL env var on Render dashboard with correct Upstash credentials',
      });
      // Auth errors will never self-resolve — stop reconnecting immediately
      conn.disconnect(false);
      return;
    }

    log.error('Redis', 'Connection error', { error: err.message });
    recordFailure('Redis');

    if (isCircuitOpen('Redis')) {
      sendSlackAlert('🔴 Redis Circuit Breaker OPEN', {
        message: 'Redis connection failed 3 times. Queue operations will fail.',
        host: safeHostname(redisUrl),
        action: 'Check Redis health immediately',
        nextRetryIn: '30 seconds',
      }).catch((alertErr) => {
        log.error('Redis', 'Failed to send Slack alert', { error: alertErr.message });
      });
    }
  });
}

export function initializeRedis(): void {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    log.warn('Redis', 'REDIS_URL not set, skipping initialization');
    return;
  }

  try {
    redisClient = new Redis(redisUrl, buildRedisOptions(redisUrl));
    connections.push(redisClient);

    redisClient.on('connect', () => {
      log.info('Redis', 'Connected successfully', { host: safeHostname(redisUrl) });
      recordSuccess('Redis');
    });

    attachErrorHandler(redisClient, redisUrl);

    redisClient.on('reconnecting', () => {
      log.info('Redis', 'Attempting to reconnect...', { host: safeHostname(redisUrl) });
    });
  } catch (error) {
    log.error('Redis', 'Failed to initialize Redis', { error: (error as Error).message });
  }
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

/**
 * Creates a NEW Redis connection for BullMQ.
 * BullMQ requires separate connections for Queue, Worker, and QueueEvents.
 * Each call returns a fresh ioredis instance from the same REDIS_URL.
 */
export function createRedisConnection(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    log.warn('Redis', 'REDIS_URL not set, cannot create connection');
    return null;
  }

  const conn = new Redis(redisUrl, buildRedisOptions(redisUrl));

  conn.on('connect', () => {
    log.info('Redis', 'Queue connection established', { host: safeHostname(redisUrl) });
    recordSuccess('Redis');
  });

  attachErrorHandler(conn, redisUrl);

  connections.push(conn);
  return conn;
}

export async function closeRedis(): Promise<void> {
  for (const conn of connections) {
    try {
      await conn.quit();
    } catch {
      // Connection may already be closed
    }
  }
  connections.length = 0;
  redisClient = null;
  log.info('Redis', 'All Redis connections closed');
}
