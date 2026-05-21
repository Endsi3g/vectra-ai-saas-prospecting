# Vectra OS — AI SaaS Prospecting Copilot 🚀

Vectra is a state-of-the-art AI-driven B2B prospecting workspace for startups, solopreneurs, and agencies. Combine natural language sourcing, autonomous agent personalization, and a unified outreach inbox — reducing candidate sourcing and personalized outreach from hours to seconds.

**Build:** ✅ Passing | **Stack:** Next.js 16 + Supabase + Nylas V3 + OpenRouter

---

## Key Features 🌟

### 1. Interactive Onboarding & Tour Guide
- Multi-step workspace setup tailored for Solopreneurs, Agencies, and SaaS startups
- Auto-routing tour guide with interactive tooltips across all core views

### 2. Dashboard & Analytics
- At-a-glance KPIs: active campaigns, CRM contacts, credit allocation, trial status
- Campaign activity feed with status and angle summaries

### 3. Natural Language Sourcing Copilot (`/app/sourcing`)
- Express candidate criteria in plain language
- Incremental sourcing timeline: extraction → indexing → candidate profiling

### 4. Lead Library & Collections (`/app/library`)
- Sync LinkedIn accounts for a unified candidate database
- Drag-and-drop CSV import + collections with `⌘ K` quick search
- AI Match Score badges (High / Medium / Low)

### 5. Outreach Hub (`/app/outreach`)
- NLP pitch panel with Copilot suggestions
- Personalization scoring + shortlist/hide controls per candidate

### 6. Unified Inbox & Magic Replies (`/app/inbox`)
- Triple-pane: sentiment filters → thread history → prospect profile
- One-click Magic Replies: propose a call, justify pricing, send a use case

### 7. Autonomous Agent Workflows (`/app/agents`)
- Toggle **Hermes** (sourcing), **Apollo** (personalization), **Athena** (news monitor)
- Adjustable fit sliders, daily limits, tone & frequency settings

### 8. Analytics & Conversion Funnel (`/app/analytics`)
- Real-time KPIs: sent, open rate, reply rate, meetings booked
- Visual conversion funnel + weekly activity chart + campaign comparison table
- CSV export

### 9. Follow-up Pipeline Tracker (`/app/followup`)
- Live pipeline: last contact, next touchpoint, CRM stage badges
- Overdue alerting with **"En retard"** warning badge
- Inline status selectors synced to database

### 10. Cold Calling AI Trainer (`/app/training`)
- Personas: *Le CEO Pressé*, *Le CTO Sceptique*, *Le RH sans Budget*
- Difficulty levels (Easy / Medium / Hard) with typewriter AI responses
- Post-call scorecard: Listening Score, Persuasion Score

### 11. Connected Mailboxes (`/app/settings/mailboxes`)
- **Nylas V3 OAuth** for Gmail and Outlook
- Grant ID persisted to Supabase for subsequent email sending

---

## Technical Stack 🛠️

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + Turbopack |
| Monorepo | Turborepo (`apps/web` + `packages/ui`) |
| Styling | Tailwind CSS + custom CSS variables |
| Database & Auth | Supabase JS v2 (Postgres + RLS) |
| Email OAuth | Nylas V3 API |
| AI / LLM | OpenRouter (gemini-2.0-flash-exp:free) |
| Billing | Stripe (Checkout + Portal + Webhooks) |
| Analytics | PostHog |
| Monitoring | Sentry + `/api/health` uptime endpoint |
| Testing | Playwright E2E |

---

## Getting Started ⚙️

### Prerequisites
- Node.js v18+
- npm

### Installation
```bash
git clone <repository-url>
cd vectra-os
npm install
```

### Environment Variables
Create `apps/web/.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Nylas V3
NYLAS_CLIENT_ID=your_nylas_client_id
NYLAS_CLIENT_SECRET=your_nylas_client_secret
NYLAS_REDIRECT_URI=http://localhost:3000/api/auth/nylas/callback

# AI — at least one required (app works in mock mode without either)
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_AGENCY=price_...

# Optional services
RESEND_API_KEY=re_...
SERPER_API_KEY=...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```

---

## Quick Setup — One-Shot Deployment Guide 🚀

### Step 1 — Supabase (15 min)
1. Go to https://app.supabase.com → New Project (name: `vectra-os`, region: `us-east-1`)
2. Settings → API → copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
3. SQL Editor → run in order:
   - `supabase/migrations/20260520000000_init.sql`
   - `supabase/migrations/20260521000001_add_brevo_and_api_keys.sql`
   - `supabase/migrations/20260521000002_add_activity_logs_and_comments.sql`
4. Authentication → Settings → disable "Email confirmations" for dev

### Step 2 — OpenRouter (5 min) — minimum required for AI
1. https://openrouter.ai → Account → API Keys → Create Key
2. Copy → `OPENROUTER_API_KEY=sk-or-v1-...`
3. Note: Free models available (e.g. `meta-llama/llama-3-8b-instruct`)
4. Without any AI key, the app runs in template mock mode — no crash

### Step 3 — Nylas V3 (20 min) — for mailbox OAuth
1. https://dashboard.nylas.com → New Application
2. Enable Google + Microsoft providers
3. Redirect URIs → add: `https://your-domain.com/api/auth/nylas/callback`
4. Copy: `Client ID` → `NYLAS_CLIENT_ID`, `Client Secret` → `NYLAS_CLIENT_SECRET`
5. Without Nylas credentials, the app runs a mock OAuth loop — no crash

### Step 4 — Stripe (30 min) — for billing
1. https://dashboard.stripe.com → Developers → API Keys → copy Secret key
2. Products → create two recurring products:
   - "Starter Plan" $199/mo → copy Price ID → `STRIPE_PRICE_SOLO`
   - "Scale Plan" $499/mo → copy Price ID → `STRIPE_PRICE_AGENCY`
3. Webhooks → Add Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

### Step 5 — Optional Services
| Service | Variable | Purpose |
|---------|----------|---------|
| Resend | `RESEND_API_KEY` | Transactional email |
| Serper.dev | `SERPER_API_KEY` | Google search for sourcing |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |

All optional — app gracefully degrades without them.

### Step 6 — Deploy to Vercel (10 min)
1. https://vercel.com → Import Git Repository → `Endsi3g/vectra-ai-saas-prospecting`
2. Framework: Next.js, Root Directory: `apps/web`
3. Environment Variables → add all variables above (with production URLs)
4. Deploy → copy the Vercel URL → update `NEXT_PUBLIC_SITE_URL` + Supabase Auth URLs + Nylas Redirect URI

### Offline / Zero-Config Mode
The app starts cleanly without any environment variables:
- Supabase: mock session + local fallback data
- AI: template-based outreach messages (no API call)
- Nylas: mock OAuth loop (callback simulated)
- Stripe: pricing pages visible, checkout mocked
- Sentry/PostHog: silently disabled

---

## Testing 🧪

```bash
# Run all E2E tests (headless)
npx playwright test

# Run with visual UI inspector
npx playwright test --ui
```

All mock behaviors (auth session, profiles, campaigns, leads, messages) are defined in `apps/web/tests/vectra.spec.ts`.

---

## UI System

The app uses a refined 260px sidebar layout with:
- **Orange trial announcement bar** (full-width, above sidebar + content)
- **`bg-[#FBFBFC]`** sidebar background with collapsible `w-[260px]` / `w-16` toggle
- **Emerald workspace logo** with dropdown chevron
- **`⌘ K` / `⌘ /`** quick-search shortcut buttons
- **Trial complete card** at sidebar bottom with orange progress bar

---

## Documentation 📚

- [`handoff.md`](./handoff.md) — SQL schemas, Nylas V3 flow, UI system specs, roadmap
- [`design.md`](./design.md) — Color tokens, animation keyframes, component specifications
- [`supabase_schema.sql`](./supabase_schema.sql) — Full production-ready SQL schema
