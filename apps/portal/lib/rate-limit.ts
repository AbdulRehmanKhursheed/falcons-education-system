/**
 * In-memory token-bucket rate limiter.
 *
 * Intended use: throttle login attempts per IP. Single-instance friendly.
 * For multi-instance / serverless-with-cold-starts setups, swap this out for
 * a Redis-backed implementation (e.g. @upstash/ratelimit) without changing
 * the call sites — the public API here is intentionally minimal.
 *
 *   const result = rateLimit(ip, { limit: 5, windowMs: 15 * 60_000 });
 *   if (!result.allowed) -> reject with result.retryAfterMs
 *
 * Successful operations should call `resetRateLimit(ip)` to clear the bucket.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the Map doesn't leak across long process lifetimes.
// `setInterval` is fine here — Next.js workers reuse the module; new workers
// get a fresh map. We `unref` so the interval doesn't keep the event loop alive.
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: NodeJS.Timeout | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  // In Node runtimes, prevent the timer from blocking shutdown.
  if (typeof cleanupTimer.unref === 'function') cleanupTimer.unref();
}

export type RateLimitOptions = {
  /** Max attempts allowed in the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  resetAt: number;
};

/**
 * Increments the counter for `key` and returns whether the call is allowed.
 * Callers should treat `allowed === false` as a hard rejection.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: opts.limit - 1,
      retryAfterMs: 0,
      resetAt,
    };
  }

  if (existing.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    retryAfterMs: 0,
    resetAt: existing.resetAt,
  };
}

/** Read-only peek — does NOT increment the counter. Useful for middleware. */
export function peekRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    return { allowed: true, remaining: opts.limit, retryAfterMs: 0, resetAt: 0 };
  }
  if (existing.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      resetAt: existing.resetAt,
    };
  }
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    retryAfterMs: 0,
    resetAt: existing.resetAt,
  };
}

/** Clear the bucket — call after a successful login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Extract client IP from a Request's headers. Falls back to 'unknown'. */
export function ipFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    // First IP in the comma-separated list is the original client.
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

// Login limit configuration — exported so middleware + authorize agree.
export const LOGIN_RATE_LIMIT: RateLimitOptions = {
  limit: 5,
  windowMs: 15 * 60_000, // 15 minutes
};

/** Build the bucket key for a login attempt. */
export function loginRateLimitKey(ip: string): string {
  return `login:${ip}`;
}
