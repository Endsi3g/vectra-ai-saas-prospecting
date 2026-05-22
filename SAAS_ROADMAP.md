# Vectra OS — Feuille de Route SaaS Public Payant

> **Statut :** Prêt pour usage interne ✅ | En cours de transformation SaaS public 🚧  
> **Dernière mise à jour :** 2026-05-21

---

## Vue d'ensemble

L'application est aujourd'hui opérationnelle à 100% pour un usage interne (équipe de 2-3 personnes). La transformation en SaaS public payant nécessite 4 à 8 semaines de développement ciblé, réparties en 5 blocs.

---

## PHASE A — Déploiement interne immédiat

> **Délai :** 1-2 jours | **Effort :** Configuration uniquement

### Checklist déploiement

- [ ] Créer projet Supabase (région us-east-1)
- [ ] Exécuter les 4 migrations SQL dans l'ordre :
  - `supabase/migrations/20260520000000_init.sql`
  - `supabase/migrations/20260521000001_add_brevo_and_api_keys.sql`
  - `supabase/migrations/20260521000002_add_activity_logs_and_comments.sql`
  - `supabase/migrations/20260522000000_fix_security.sql`
  - `supabase/migrations/20260522000001_enrich_leads.sql`
  - `supabase/migrations/20260522000002_invitations.sql`
- [ ] Supabase Storage → créer bucket `branding` (lecture publique, écriture authentifiée)
- [ ] Supabase Auth → désactiver confirmation email (dev) ou configurer SMTP (prod)
- [ ] Supabase Auth → Site URL = URL Vercel + Redirect URLs
- [ ] Déployer sur Vercel (Root: `apps/web`, Framework: Next.js)
- [ ] Configurer variables d'environnement (voir `README.md → Step 6`)
- [ ] Tester login, sourcing, génération IA, Stripe checkout (mode test)

---

## PHASE B — SaaS Public Payant

---

### B1 — Onboarding Self-Service (Semaine 1-2)

**Objectif :** Un nouvel utilisateur peut s'inscrire, configurer et commencer seul.

| Tâche | Fichier cible | Effort |
|-------|--------------|--------|
| Landing page publique avec pricing | `apps/web/app/page.tsx` (réécrire) | 1-2j |
| Séquence email post-inscription (J0/J1/J3/J7) | `lib/email.ts` + Resend templates | 1j |
| Activer confirmation email Supabase Auth | Supabase Dashboard | 30min |
| Créer trigger Supabase : workspace auto à l'inscription | Migration SQL + trigger `on auth.users insert` | 2h |
| Page 404 personnalisée | `apps/web/app/not-found.tsx` | 1h |
| Remplir Terms of Service (vrai contenu) | `apps/web/app/legal/terms/page.tsx` | 2h |
| Remplir Privacy Policy (RGPD conforme) | `apps/web/app/legal/privacy/page.tsx` | 2h |
| Page `/billing/success` post-paiement | Créer `apps/web/app/billing/success/page.tsx` | 2h |
| Page `/billing/cancel` annulation | Créer `apps/web/app/billing/cancel/page.tsx` | 1h |

**Migration SQL — Workspace auto à l'inscription :**
```sql
-- À ajouter dans une migration 20260523000000_auto_workspace.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name) VALUES ('Mon Workspace')
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.profiles (id, email, workspace_id, plan, credits_count, credits_limit, tour_completed)
  VALUES (NEW.id, NEW.email, new_workspace_id, 'alpha_free', 2000, 2000, false);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### B2 — Facturation Production (Semaine 2-3)

**Objectif :** Passer de Stripe test à Stripe live avec trial automatique et gestion downgrades.

| Tâche | Fichier cible | Effort |
|-------|--------------|--------|
| Passer Stripe en mode live | Variable `STRIPE_SECRET_KEY` (sk_live_...) | 5min |
| Trial 14 jours automatique à l'inscription | `lib/email.ts` + trigger inscription | 2h |
| Ajouter colonne `trial_ends_at` à profiles | Migration SQL | 30min |
| Bannière "Trial expire dans X jours" | `apps/web/app/app/layout.tsx` (déjà présent, câbler) | 1h |
| Modal "Crédits épuisés → Upgrade" | Composant global dans `app/layout.tsx` | 2h |
| Page succès Stripe (afficher récap commande) | `apps/web/app/billing/success/page.tsx` | 2h |
| Factures PDF via Stripe Portal | Déjà intégré ✅ | — |

**Migration SQL :**
```sql
-- 20260523000001_trial.sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
```

---

### B3 — Sécurité & Rate Limiting (Semaine 3)

**Objectif :** Protéger l'infrastructure contre les abus, bots et attaques DDoS.

| Tâche | Fichier cible | Effort |
|-------|--------------|--------|
| Rate limiting routes LLM (10 req/min/user) | `lib/rate-limit.ts` + Upstash Redis | 4h |
| Rate limiting global routes API (100 req/min/IP) | `apps/web/middleware.ts` | 2h |
| CAPTCHA à l'inscription | `/auth/sign-up` + Cloudflare Turnstile | 3h |
| Whitelist domaines sur `/api/sourcing/scrape` | `app/api/sourcing/scrape/route.ts` | 1h |
| Validation email format sur `/api/email/send` | `app/api/email/send/route.ts` | 30min |
| Headers `Content-Length` sur uploads | `app/api/brevo/contacts/route.ts` | 30min |

**Dépendances à installer :**
```bash
npm install @upstash/redis @upstash/ratelimit
```

**Variables à ajouter :**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

---

### B4 — Multi-tenancy Robuste (Semaine 3-4)

**Objectif :** Isolation totale des données entre clients, quotas par workspace.

| Tâche | Fichier cible | Effort |
|-------|--------------|--------|
| Vérifier RLS sur toutes les tables (audit) | Toutes les migrations | 2h |
| Quota credits check avant chaque appel IA | `lib/credits.ts` (créer) + routes agents | 3h |
| Système invitation token custom (table déjà créée ✅) | `app/api/auth/accept-invite/route.ts` | 3h |
| Page d'acceptation invitation | `app/app/settings/members/page.tsx` | 2h |
| Isolation workspaces dans analytics | `app/app/analytics/page.tsx` | 1h |

**Middleware crédits :**
```typescript
// lib/credits.ts
export async function checkAndDeductCredits(userId: string, amount: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('credits_count')
    .eq('id', userId)
    .single();

  if (!data || data.credits_count < amount) return false;

  await supabaseAdmin
    .from('profiles')
    .update({ credits_count: data.credits_count - amount })
    .eq('id', userId);

  return true;
}
```

---

### B5 — Observabilité & Support (Semaine 4-5)

**Objectif :** Savoir ce qui se passe en production, pouvoir répondre aux clients.

| Tâche | Service | Effort |
|-------|---------|--------|
| Configurer Sentry DSN en production | Sentry.io | 30min |
| Configurer PostHog + funnel conversion | PostHog Cloud | 1h |
| Support in-app chat | Crisp.chat (1 script) | 1h |
| Alertes uptime | UptimeRobot → `/api/health` toutes 5 min | 15min |
| Dashboard erreurs Slack | Sentry → Slack webhook | 30min |
| Logs structurés production | Pino + Vercel Log Drains | 2h |

**Variables à ajouter :**
```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_CRISP_WEBSITE_ID=...
```

**Events PostHog à tracker :**
```typescript
// Funnel de conversion à mesurer
'user_signed_up'         // J0
'onboarding_completed'   // J0-J1
'first_sourcing_run'     // Activation
'first_outreach_sent'    // Engagement
'plan_upgraded'          // Conversion
'churned'                // Churn
```

---

### B6 — Go-to-Market (Semaine 5-8)

**Objectif :** Acquérir les premiers clients payants.

| Tâche | Service/Fichier | Effort |
|-------|----------------|--------|
| Landing page publique (SEO + pricing) | `apps/web/app/page.tsx` | 3-5j |
| Blog / articles SEO | Next.js MDX ou Contentful | 2-3j |
| Programme d'affiliation | Rewardful + `app/app/settings/referrals/` | 1-2j |
| Campagne ProductHunt | ProductHunt | 2j |
| Emails marketing (nurture) | Brevo (déjà intégré ✅) | 1j |
| Intégration CRM externe (ex: HubSpot) | Webhook Supabase → HubSpot | 2j |

**Structure landing page recommandée :**
```
Hero → Problème (prospection manuelle = 4h/jour)
→ Solution (Vectra = 15 min)
→ Features (6 modules)
→ Pricing (3 plans)
→ Social proof (témoignages)
→ FAQ
→ CTA final
```

---

## Récapitulatif effort total

| Phase | Délai | Résultat |
|-------|-------|---------|
| A — Déploiement interne | 1-2 jours | App opérationnelle pour l'équipe |
| B1 — Onboarding | 1-2 semaines | Self-service possible |
| B2 — Facturation live | +1 semaine | Premiers paiements réels |
| B3 — Rate limiting | +1 semaine | Protection abus |
| B4 — Multi-tenancy | +1 semaine | Isolation clients |
| B5 — Observabilité | +1 semaine | Visibilité prod |
| B6 — Go-to-Market | +2-3 semaines | Premiers clients |
| **TOTAL** | **6-8 semaines** | **SaaS public payant** |

---

## Stack technique cible (production SaaS)

```
Frontend  : Next.js 16 + Vercel (Edge Network)
Database  : Supabase PostgreSQL (RLS, branching)
Auth      : Supabase Auth (email/OAuth)
Email     : Resend (transactionnel) + Brevo (marketing)
Paiement  : Stripe (Checkout + Portal + Webhooks)
IA / LLM  : OpenRouter (multi-modèles, fallback gratuit)
Sourcing  : Serper.dev + ScrapeGraphAI
CRM email : Nylas V3 (Gmail + Outlook OAuth)
Monitoring: Sentry + PostHog
Cache/RL  : Upstash Redis
Support   : Crisp.chat
CDN assets: Supabase Storage
```

---

## Commandes de déploiement

```bash
# Déploiement Vercel (depuis la racine du repo)
vercel --cwd apps/web

# Migrations Supabase
supabase db push

# Build de vérification
npm run build

# Tests E2E complets
npx playwright test

# Health check production
curl https://your-domain.vercel.app/api/health
```

---

*Document créé le 2026-05-21 — À mettre à jour après chaque phase complétée.*
