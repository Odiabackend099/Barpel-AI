/**
 * Global Exception Handlers
 * Catches uncaught exceptions and unhandled promise rejections
 * Reports to Sentry and attempts graceful shutdown
 */

import * as Sentry from '@sentry/node';
import { log } from '../services/logger';
import { sendSlackAlert } from '../services/slack-alerts';

export function setupExceptionHandlers(): void {
  // Uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    log.error('Process', 'Uncaught Exception', { error: error.message, stack: error.stack });
    
    Sentry.captureException(error, { level: 'fatal' });
    sendSlackAlert(' CRITICAL: Uncaught Exception', {
      error: error.message,
      stack: error.stack
    }).catch(() => {});
    
    // Graceful shutdown after 2s
    setTimeout(() => process.exit(1), 2000);
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason: {} | null | undefined, promise: Promise<any>) => {
    log.error('Process', 'Unhandled Rejection', { reason: String(reason) });
    
    Sentry.captureMessage(`Unhandled Rejection: ${reason}`, { level: 'fatal' });
    sendSlackAlert(' CRITICAL: Unhandled Rejection', {
      reason: String(reason)
    }).catch(() => {});
  });

  // Note: SIGTERM/SIGINT handlers are in server.ts (gracefulShutdown)
  // to avoid duplicate handler conflicts. Sentry flush happens via
  // Sentry.close() during the graceful shutdown sequence.
}
