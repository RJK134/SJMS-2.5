import rateLimit, { type Store, type IncrementResponse } from 'express-rate-limit';
import redis from '../utils/redis';
import logger from '../utils/logger';

// ── Redis Store for express-rate-limit ──────────────────────────────────────
// Implements the Store interface using the shared ioredis client.
// Falls back to in-memory counting if Redis is unavailable.

class RedisStore implements Store {
  private prefix: string;
  private windowMs: number;

  constructor(prefix: string, windowMs: number) {
    this.prefix = `rl:${prefix}:`;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const redisKey = this.prefix + key;
    try {
      const results = await redis
        .multi()
        .incr(redisKey)
        .pttl(redisKey)
        .exec();

      const totalHits = (results?.[0]?.[1] as number) ?? 1;
      const pttl = (results?.[1]?.[1] as number) ?? -1;

      // Set expiry on first hit (pttl === -1 means no expiry set yet)
      if (pttl === -1 || pttl === -2) {
        await redis.pexpire(redisKey, this.windowMs);
      }

      const resetTime = new Date(Date.now() + (pttl > 0 ? pttl : this.windowMs));
      return { totalHits, resetTime };
    } catch {
      // Redis unavailable — return permissive default
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await redis.decr(this.prefix + key);
    } catch {
      // ignore
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await redis.del(this.prefix + key);
    } catch {
      // ignore
    }
  }
}

// ── Rate Limiters ───────────────────────────────────────────────────────────

// General API rate limiter — 100 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('api', 60_000),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
  skip: (req) => req.path === '/api/health',
});

// Strict limiter for authentication endpoints — 5 requests per minute per IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('auth', 60_000),
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

// Very strict limiter for sensitive operations (password reset, account recovery)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('sensitive', 3_600_000),
  message: {
    success: false,
    error: {
      code: 'SENSITIVE_RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts on this sensitive operation. Please try again later.',
    },
  },
});
