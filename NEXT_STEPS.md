# Next Steps: Public SaaS Road to Production (v4.5+)

With the completion of **B1 (Onboarding Self-Service)** and **B3 (Security & Rate Limiting)**, the core foundational and security layers for the public launch of Vectra are fully operational.

The remaining roadmap steps for production readiness are outlined below:

---

## 🚀 Milestone B2: Production Billing (Facturation Production)
*Target: Move from Stripe Test Mode to Stripe Live, set up automatic trials, and handle quotas/upgrades.*

1. **Stripe Production Transition**
   * Change Stripe key environment variables to production values (`sk_live_...` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
   * Map product IDs and price IDs from Stripe dashboard to `apps/web/config/billing.ts`.
2. **Automatic 14-Day Trial**
   * Add a `trial_ends_at` column to the `profiles` table:
     ```sql
     ALTER TABLE public.profiles
       ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
     ```
   * Configure the sign-up flow and SQL triggers to automatically compute and store this timestamp.
3. **Trial Expiration UI Banner**
   * Wire the dynamic banner in `apps/web/app/app/layout.tsx` to display: *"Votre période d'essai se termine dans X jours. Passer Pro"*.
4. **Out of Credits Global Modal**
   * Add a global interstitial modal triggered when a user runs out of credits or attempts an action past their limits.
   * Provide a clean CTA button linking directly to the Stripe pricing options.
5. **Enriched Stripe Success Page**
   * Update `/billing/success` to display detailed order details, invoice download links, and onboarding guidelines.

---

## 🔒 Milestone B4: Robust Multi-tenancy (Multi-tenancy Robuste)
*Target: Total data isolation between workspaces and dynamic credit/quota checks.*

1. **Row-Level Security (RLS) Audit**
   * Review all Postgres tables to ensure `ENABLE ROW LEVEL SECURITY` is applied and verified.
   * Write tests or verify policies for `workspaces`, `profiles`, `leads`, `activity_logs`, and `comments` to prevent cross-tenant exposure.
2. **Credits Validation Helper & Quota Deduction**
   * Create `lib/credits.ts` and wire it into AI generation and sequence routing.
   * Before running an agent task, check credit balances and decrement counts upon successful execution:
     ```typescript
     export async function checkAndDeductCredits(userId: string, amount: number): Promise<boolean>;
     ```
3. **Accept Workspace Invitations Handler**
   * Implement `/api/auth/accept-invite/route.ts` to consume single-use secure tokens from the `invitations` table.
   * Link the incoming user to the target workspace and set correct permissions in `workspace_members`.
4. **Workspace settings & Member List UX**
   * Add a collaborative team management panel in `apps/web/app/app/settings/members/page.tsx` to invite teammates and adjust roles.
5. **Analytics Scoping**
   * Scopes all metrics, leads, and dashboards to the active `workspace_id`.

---

## 📊 Milestone B5: Observability & Support (Observabilité & Support)
*Target: Production monitoring, logging, and customer engagement.*

1. **Sentry Error Tracking**
   * Initialize `@sentry/nextjs` with the correct production DSN.
   * Configure error tracking filters to ignore known browser extension noise.
2. **PostHog Analytics Funnel**
   * Track key lifecycle events: `user_signed_up`, `onboarding_completed`, `first_sourcing_run`, `first_outreach_sent`, `plan_upgraded`, and `churned`.
3. **Crisp Chat Integration**
   * Load the live Crisp chat widget in `/app` routes for immediate customer support.
4. **Pino Structured Logging**
   * Implement structured JSON logging via Pino for high-performance serverless logs and trace mapping.
