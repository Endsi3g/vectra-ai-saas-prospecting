// In-memory sliding window rate limiter per API key.
// In production with multiple Vercel instances, use Redis (Upstash).
// This implementation is sufficient for single-instance or low-concurrency deployments.

const PLAN_LIMITS: Record<string, number> = {
  alpha_free: 100,
  free: 100,
  solo: 500,
  agence: 2000,
  admin: 10000,
};

const DEFAULT_LIMIT = 100;
const WINDOW_MS = 60_000; // 1 minute

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Prune stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store.entries()) {
    if (now > win.resetAt) store.delete(key);
  }
}, 5 * 60_000);

export function checkRateLimit(keyId: string, plan: string): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const limit = PLAN_LIMITS[plan] ?? DEFAULT_LIMIT;
  const now = Date.now();
  const existing = store.get(keyId);

  if (!existing || now > existing.resetAt) {
    store.set(keyId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, limit, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }

  existing.count++;
  const remaining = Math.max(0, limit - existing.count);
  return {
    allowed: existing.count <= limit,
    limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

export function rateLimitHeaders(result: ReturnType<typeof checkRateLimit>): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
