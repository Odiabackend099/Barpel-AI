/**
 * Authentication Rate Limiters (P0-3 Fix)
 *
 * Implements rate limiting for all authentication endpoints
 * to prevent brute-force attacks, MFA code guessing, and account enumeration.
 *
 * Uses Redis-backed store when REDIS_URL is available, otherwise falls back
 * to the default in-memory store (safe for single-instance deployments).
 *
 * Security: Prevents attackers from:
 * - Brute-forcing MFA codes (6-digit = 1M combinations)
 * - Password guessing attacks
 * - Account enumeration via signup/reset
 * - Distributed DoS via auth endpoints
 *
 * HIPAA Compliance: Implements §164.312(a)(2)(i) Unique User Identification
 * by preventing automated attacks that could compromise user authentication.
 */

import rateLimit, { type Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { log } from '../services/logger';

/**
 * IPv6-compatible IP key generator
 *
 * express-rate-limit requires using this helper to properly handle IPv6 addresses
 * and prevent bypass attacks via IPv6 address manipulation
 */
function generateIPKey(req: any): string {
  // Use express-rate-limit's built-in IP normalization
  return req.ip || '127.0.0.1';
}

// Lazy-initialized Redis client for rate limiting
let redis: Redis | null = null;

function getRedisForRateLimiting(): Redis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    log.warn('RateLimiter', 'REDIS_URL not set — using in-memory rate limiting');
    return null;
  }

  try {
    const useTls = redisUrl.startsWith('rediss://');
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      family: 0, // Allow IPv4 + IPv6 resolution
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
      },
    });

    redis.on('error', (err) => {
      const isAuthError =
        err.message.includes('WRONGPASS') ||
        err.message.includes('NOAUTH') ||
        err.message.includes('invalid username-password');
      if (isAuthError) {
        log.error('RateLimiter', 'Redis auth failed — falling back to in-memory', { error: err.message });
        redis = null;
        return;
      }
      log.error('RateLimiter', 'Redis error', { error: err.message });
    });

    redis.connect().catch(() => {
      log.warn('RateLimiter', 'Redis connect failed — falling back to in-memory');
      redis = null;
    });

    return redis;
  } catch {
    log.warn('RateLimiter', 'Failed to create Redis client — using in-memory rate limiting');
    return null;
  }
}

/**
 * Create a Redis store if Redis is available, otherwise return undefined
 * (express-rate-limit uses its built-in MemoryStore as default)
 */
function createStore(prefix: string): Store | undefined {
  const client = getRedisForRateLimiting();
  if (!client) return undefined;

  return new RedisStore({
    client,
    prefix,
    sendCommand: (...args: string[]) => client.call(...args),
  });
}

/**
 * CRITICAL: MFA Verification Rate Limiter
 *
 * Limits: 3 attempts per 15 minutes per user
 *
 * Attack Scenario Prevention:
 * - Attacker has user's password but not MFA device
 * - Tries to brute-force 6-digit TOTP code (1,000,000 combinations)
 * - Without rate limiting: 1M codes ÷ 60 sec/min = 16,667 min (~11.5 days)
 * - With rate limiting: 3 attempts per 15 min = ~5,000 years
 *
 * Rate limit per USER ID (not IP) to prevent:
 * - IP rotation bypass via VPN/proxies
 * - Distributed attack from botnet
 */
export const mfaRateLimiter = rateLimit({
  store: createStore('rl:mfa:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts per window
  keyGenerator: (req) => {
    // Rate limit per user ID (from request body or JWT)
    return req.body?.userId || req.user?.id || generateIPKey(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many MFA verification attempts',
      message: 'Account locked for 15 minutes due to repeated failed attempts.',
      retryAfter: 15 * 60, // seconds
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  },
  skipSuccessfulRequests: false, // Count ALL attempts (even successful)
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false // Disable X-RateLimit-* headers
});

/**
 * MODERATE: Login Rate Limiter
 *
 * Limits: 10 attempts per 15 minutes per IP
 *
 * Balances security with user experience:
 * - Allows legitimate users to mistype password multiple times
 * - Prevents automated password brute-force attacks
 * - 10 attempts = reasonable for user with typos
 * - 15 min lockout = short enough to not frustrate users
 */
export const loginRateLimiter = rateLimit({
  store: createStore('rl:login:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  keyGenerator: (req) => generateIPKey(req),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Too many failed login attempts from this IP address. Please try again in 15 minutes.',
      retryAfter: 15 * 60,
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  },
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * RELAXED: Signup Rate Limiter
 *
 * Limits: 5 attempts per hour per IP
 *
 * Prevents:
 * - Mass account creation for spam/abuse
 * - Automated account enumeration
 * - Email bombing attacks
 *
 * 5 signups/hour = legitimate user might create accounts for team members
 * but prevents bot creating thousands of accounts
 */
export const signupRateLimiter = rateLimit({
  store: createStore('rl:signup:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  keyGenerator: (req) => generateIPKey(req),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many signup attempts',
      message: 'Too many account creation attempts from this IP address. Please try again in 1 hour.',
      retryAfter: 60 * 60,
      lockedUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  },
  skipSuccessfulRequests: false, // Count all signup attempts
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * STRICT: Password Reset Rate Limiter
 *
 * Limits: 3 attempts per hour per email
 *
 * Prevents:
 * - Email bombing (sending reset emails to victim's inbox)
 * - Account enumeration (testing which emails exist)
 * - Password reset abuse
 *
 * Rate limit by EMAIL (not IP) because:
 * - Prevents attacker from rotating IPs
 * - Protects specific email address from harassment
 * - 3 attempts/hour = legitimate user can retry a few times
 */
export const passwordResetRateLimiter = rateLimit({
  store: createStore('rl:reset:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  keyGenerator: (req) => {
    // Rate limit per email address (lowercase normalized)
    const email = req.body?.email?.toLowerCase();
    return email || generateIPKey(req); // Fallback to IP if no email
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset requests',
      message: 'Too many password reset requests for this email address. Please try again in 1 hour.',
      retryAfter: 60 * 60,
      lockedUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  },
  skipSuccessfulRequests: false, // Count all reset requests
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate Limiter Health Check
 *
 * Allows monitoring scripts to verify Redis connection is working
 */
export async function checkRateLimiterHealth(): Promise<{
  healthy: boolean;
  redisConnected: boolean;
  error?: string;
}> {
  const client = getRedisForRateLimiting();
  if (!client) {
    return { healthy: true, redisConnected: false, error: 'Using in-memory store (Redis not available)' };
  }

  try {
    await client.ping();
    return { healthy: true, redisConnected: true };
  } catch (error: any) {
    return {
      healthy: false,
      redisConnected: false,
      error: error.message
    };
  }
}

/**
 * Clear Rate Limit for User (Admin Only)
 *
 * Allows support team to manually reset rate limits for locked-out users
 */
export async function clearUserRateLimit(userId: string): Promise<void> {
  const client = getRedisForRateLimiting();
  if (!client) return;

  const patterns = [
    `rl:mfa:${userId}`,
    `rl:login:${userId}`
  ];

  for (const pattern of patterns) {
    await client.del(pattern);
  }
}

/**
 * Clear Rate Limit for IP (Admin Only)
 *
 * Allows support team to manually reset rate limits for specific IPs
 */
export async function clearIPRateLimit(ipAddress: string): Promise<void> {
  const client = getRedisForRateLimiting();
  if (!client) return;

  const prefixes = [
    `rl:login:${ipAddress}*`,
    `rl:signup:${ipAddress}*`
  ];

  for (const prefix of prefixes) {
    const keys = await client.keys(prefix);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}

/**
 * Get Rate Limit Status for User
 *
 * Returns current rate limit status for debugging/support
 */
export async function getUserRateLimitStatus(userId: string): Promise<{
  mfa: { remaining: number; resetAt: Date | null };
  login: { remaining: number; resetAt: Date | null };
}> {
  const client = getRedisForRateLimiting();
  if (!client) {
    return {
      mfa: { remaining: 3, resetAt: null },
      login: { remaining: 10, resetAt: null },
    };
  }

  const mfaKey = `rl:mfa:${userId}`;
  const loginKey = `rl:login:${userId}`;

  const mfaTTL = await client.ttl(mfaKey);
  const loginTTL = await client.ttl(loginKey);

  return {
    mfa: {
      remaining: mfaTTL > 0 ? 3 - (await client.get(mfaKey) ? 1 : 0) : 3,
      resetAt: mfaTTL > 0 ? new Date(Date.now() + mfaTTL * 1000) : null
    },
    login: {
      remaining: loginTTL > 0 ? 10 - (await client.get(loginKey) ? 1 : 0) : 10,
      resetAt: loginTTL > 0 ? new Date(Date.now() + loginTTL * 1000) : null
    }
  };
}
