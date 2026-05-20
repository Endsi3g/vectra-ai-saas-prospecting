# Vectra — AI SaaS Prospecting Copilot 🚀

Vectra is a state-of-the-art AI-driven B2B prospecting workspace designed for startups, solopreneurs, and agencies. By combining natural language sourcing queries, shared LinkedIn network mapping, and autonomous agent personalization, Vectra reduces candidate sourcing and personalized outreach from hours to seconds.

Inspired by premium visual systems and the direct, interactive network search of Wrangle, Vectra is built to deliver a premium user experience and high-impact outreach conversions.

---

## Key Features 🌟

### 1. Interactive Onboarding & User Guidance
- **Visual Onboarding Flow**: Multi-step workspace selection and personalization parameters tailored for Solopreneurs, Agencies, and SaaS startups.
- **Tour Guide Widget**: Integrated post-onboarding tour guide that automatically routes users between views (Dashboard, Sourcing, Library, Outreach) with highlighting and interactive tooltips.

### 2. High-Performance Dashboard & Analytics
- **At-a-Glance Metrics**: View active search campaigns, aggregated CRM contacts, credit allocations, and trial details.
- **Campaign Activity Feed**: Interactive tables and cards summarizing campaign angles, current status, and run details.

### 3. Natural Language Sourcing Copilot
- **Agent Chat Interface**: Express candidate criteria in natural language. Powered by mocked **Hermes-Agent** and **ScrapeGraphAI** streaming backend.
- **Incremental Sourcing Timelines**: Visual step progress trackers showing search parameter extraction, database indexing, and candidate profiling.

### 4. Aggregated Library & Shared Networks
- **Linked LinkedIn Accounts**: Sync team LinkedIn accounts to build a unified database.
- **Privacy & Sync Controls**: Fine-tune sync criteria (CRM vs. LinkedIn Connections) and access controls (Private vs. Team Shared vs. Direct Search Links).
- **Candidates Import CSV Dropzone**: Direct drag-and-drop file imports of target lead databases.

### 5. Outreach Hub with Wrangle Personalization
- **Natural Language Pitching**: Pitch offerings and target audiences using an NLP text panel.
- **Copilot Outreach Insights**: Contextual suggestions summarizing lead lists and advising on prioritization.
- **Fit: High/Med/Low Badging**: AI-calculated personalization scoring to identify high-probability conversions.
- **Shortlist / Hide Controls**: Instantly shortlist candidates for outreach or hide them from the active list to focus.

### 6. Unified Inbox & Magic Replies (`/app/inbox`)
- **Triple-pane layout**: Group messages by automated sentiment analysis tags (*Intéressés*, *Objections*, *Désabonnés*).
- **Magic Replies (IA)**: Rapid one-click objection handling, pricing justification, or meeting scheduling templates populated using dynamic context.

### 7. Autonomous Agent Workflows Panel (`/app/agents`)
- **Agent Controls**: Toggle switches to activate autonomous agents (**Hermes** sourcing scraper, **Apollo** personalization engine, and **Athena** news monitor).
- **Global Settings Controls**: Adjustable minimum fit sliders, daily lead boundaries, default tone settings, and automated workflow frequency selectors.

### 8. Analytics & Conversion Funnel Dashboard (`/app/analytics`)
- **Real-Time KPIs**: Track total sent, open rates, response rates, and scheduled meetings.
- **Visual Funnel**: Custom visual funnel tracing drops from leads down to booked meetings.
- **Data Export**: Complete outbound metrics and campaign analysis exportable in CSV format.

### 9. Follow-up Pipeline Tracker (`/app/followup`)
- **Contact Tracking Table**: Real-time pipeline oversight tracking last contact date, next planned touchpoints, and CRM stages.
- **Overdue Alerting Widget**: Dynamic check that highlights late prospects with a prominent **"En retard" (Overdue)** warning badge.
- **Status Sync Selectors**: Direct selectors to update stages (*Pas de réponse*, *Relance 1*, *Meeting pris*, *Deal conclu*) synced directly with the database.

### 10. Cold Calling AI Training & objection trainer (`/app/training`)
- **Simulated Buyer Personas**: Practice cold calls against *Le CEO Pressé*, *Le CTO Sceptique*, or *Le RH sans Budget*.
- **Objection Trainer Engine**: Interactive text-and-mic simulator with responsive AI objections based on user inputs.
- **Sales Metrics Scoreboard**: Renders post-call scorecards grading *Listening Score* and *Persuasion Score* out of 100 to measure call effectiveness.

---

## Technical Stack 🛠️

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) using [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) for ultra-fast dev server reloading.
- **Workspace Monorepo**: Managed using [Turborepo](https://turbo.build/repo) containing:
  - `apps/web`: The core Next.js web application.
  - `packages/ui`: Shared design system components.
- **Styling**: Tailwind CSS & custom CSS variables defining a sleek dark-mode inspired professional visual theme.
- **Database & Auth**: [Supabase JS Client v2](https://supabase.com/) supporting campaigns, leads, profiles, and messages schema definitions.
- **Testing Suite**: [Playwright](https://playwright.dev/) for robust, mocked End-to-End browser UI automation.

---

## Getting Started ⚙️

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vectra
   ```
2. Install workspace dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the developer workspace server for all apps and packages in the monorepo:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
To compile and build all packages in the Turborepo monorepo:
```bash
npm run build
```

---

## Testing Workflows 🧪

Vectra includes a complete suite of E2E Playwright tests covering page routing, UI widgets, component states, and Supabase database interactions:

### Run E2E Tests
To run all Playwright test specs in headless browser mode:
```bash
npx playwright test
```

### Run Tests in UI Mode
For visual inspection and interactive debugging of tests:
```bash
npx playwright test --ui
```

All mock behaviors (user authentication session, profiles, campaigns, leads, and messages query routing) are defined in [vectra.spec.ts](file:///c:/Vectra -AI SaaS Prospecting/vectra/apps/web/tests/vectra.spec.ts).

---

## Documentation Suite 📚

For detailed design architecture and developer handoff guidelines, refer to:
- [Design Specifications](file:///c:/Vectra -AI SaaS Prospecting/vectra/design.md): Visual aesthetics, HSL color tokens, responsive structures, and animation keyframes.
- [Developer Handoff Guide](file:///c:/Vectra -AI SaaS Prospecting/vectra/handoff.md): SQL schemas, state flows, mock configurations, and pending roadmap implementations.
