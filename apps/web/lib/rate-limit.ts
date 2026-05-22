import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/* Lazy init ratelimit instances if credentials exist */
let redis: Redis | null = null;
let llmRatelimit: Ratelimit | null = null;
let globalRatelimit: Ratelimit | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken && !redisUrl.includes('placeholder')) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    /* LLM Rate Limit: 10 requests per minute per user */
    llmRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'ratelimit:llm',
    });

    /* Global API Rate Limit: 100 requests per minute per IP */
    globalRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: 'ratelimit:global',
    });
  } catch (err) {
    console.error('Failed to initialize Upstash Redis clients:', err);
  }
}

export async function checkRateLimitLLM(userId: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  /* If not configured, or in E2E tests, allow everything */
  const isE2E = process.env.E2E_TESTING === 'true' || process.env.PLAYWRIGHT_TEST === 'true';
  if (!llmRatelimit || isE2E) {
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }

  try {
    const { success, limit, remaining, reset } = await llmRatelimit.limit(userId);
    return { success, limit, remaining, reset };
  } catch (err) {
    console.error('Rate limiting check failed (fallback to allow):', err);
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }
}

export async function checkRateLimitGlobal(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  /* If not configured, or in E2E tests, allow everything */
  const isE2E = process.env.E2E_TESTING === 'true' || process.env.PLAYWRIGHT_TEST === 'true';
  if (!globalRatelimit || isE2E) {
    return { success: true, limit: 100, remaining: 100, reset: Date.now() + 60000 };
  }

  try {
    const { success, limit, remaining, reset } = await globalRatelimit.limit(ip);
    return { success, limit, remaining, reset };
  } catch (err) {
    console.error('Rate limiting check failed (fallback to allow):', err);
    return { success: true, limit: 100, remaining: 100, reset: Date.now() + 60000 };
  }
}
