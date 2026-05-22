# Next Steps: Security, Rate Limiting, & Input Sanitization (B3)

This document outlines the next technical steps to transition Vectra AI into a production-ready SaaS application with rate limiting and input validation layers.

## Phase 1: Global Middleware Rate Limiting
1. **Update Middleware (`apps/web/lib/middleware.ts`)**
   * Integrate Upstash Redis global rate limiter (`checkRateLimitGlobal`) for all `/api/` routes.
   * Exclude webhooks (`/api/webhooks/*`) and billing portal routes (`/api/billing/*`) from rate limiting.
   * Extract client IP using `request.ip` or the first segment of the `x-forwarded-for` header, falling back to `127.0.0.1`.
   * Return a `429 Too Many Requests` response on rate limit exhaustion.

## Phase 2: Route Rate-Limits & Input Sanitization
1. **LLM Route Rate Limiting**
   * Target `/api/generate/route.ts` and `/api/training/chat/route.ts`.
   * Resolve user ID and check rate limit using `checkRateLimitLLM(userId)`.
   * Return `429 Too Many Requests` on exceeding 10 requests per minute.
2. **Domain Scraping Whitelist**
   * Update `/api/sourcing/scrape/route.ts`.
   * Restrict target domains to: `linkedin.com`, `news.ycombinator.com`, `github.com`, `google.com`, `optima-ai.io`, `flowstate.co`, `vidio.io`, `ledgerly.app`, `logix-systems.fr`, `talentloop.ai`.
   * Reject non-whitelisted domains with a `400 Bad Request` response.
3. **Email Format Validation**
   * Update `/api/email/send/route.ts`.
   * Check format of `to` field using regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`.
   * Reject invalid email formats with a `400 Bad Request` response.
4. **Brevo Upload Guard**
   * Update `/api/brevo/contacts/route.ts`.
   * Check that `Content-Length` header is present and does not exceed 5MB.
   * Reject invalid headers or oversized uploads with `413 Payload Too Large`.

## Phase 3: Verification
1. Run Playwright E2E test suite locally using:
   ```bash
   npx playwright test
   ```
2. Verify rate-limiting header responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
