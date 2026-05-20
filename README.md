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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Nylas V3
NYLAS_CLIENT_ID=d12165a7-6c3b-4efc-a754-e9fdb60833fe
NYLAS_CLIENT_SECRET=your_nylas_api_key
NYLAS_REDIRECT_URI=http://localhost:3000/api/auth/nylas/callback

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Resend
RESEND_API_KEY=your_resend_key
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
