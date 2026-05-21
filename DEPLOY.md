# Vectra OS — Guide de Déploiement Complet

> Déploiement one-shot sur Vercel + Supabase. Temps estimé : 45-60 minutes.

---

## Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [OpenRouter](https://openrouter.ai) (gratuit, modèles gratuits disponibles)
- Node.js 18+ (pour les tests locaux uniquement)

---

## ÉTAPE 1 — Supabase (15 min)

### 1.1 Créer le projet

1. → [app.supabase.com](https://app.supabase.com) → **New Project**
2. Nom : `vectra-os` | Région : `us-east-1` | Mot de passe DB : noter le mot de passe
3. Attendre la création (~2 min)

### 1.2 Récupérer les clés API

**Settings → API :**
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Garder secret**

### 1.3 Exécuter les migrations SQL

**SQL Editor → New Query** — Exécuter dans l'ordre :

```sql
-- 1. Schéma principal (tables de base)
-- Copier/coller le contenu de : supabase/migrations/20260520000000_init.sql
```
```sql
-- 2. Brevo + API Keys
-- Copier/coller : supabase/migrations/20260521000001_add_brevo_and_api_keys.sql
```
```sql
-- 3. Logs d'activité + commentaires leads
-- Copier/coller : supabase/migrations/20260521000002_add_activity_logs_and_comments.sql
```
```sql
-- 4. Fix sécurité RLS
-- Copier/coller : supabase/migrations/20260522000000_fix_security.sql
```
```sql
-- 5. Enrichissement leads (location, role, linkedin_url, phone)
-- Copier/coller : supabase/migrations/20260522000001_enrich_leads.sql
```
```sql
-- 6. Table invitations équipe
-- Copier/coller : supabase/migrations/20260522000002_invitations.sql
```

> ✅ Vérification : **Table Editor** doit montrer 15+ tables (workspaces, profiles, campaigns, leads, etc.)

### 1.4 Configurer l'authentification

**Authentication → Settings :**
- **Site URL** : `https://YOUR-APP.vercel.app` (à mettre à jour après le déploiement Vercel)
- **Redirect URLs** : Ajouter `https://YOUR-APP.vercel.app/auth/callback`
- Pour dev : désactiver "Confirm email" (Authentication → Email Templates → Disable confirmation)

### 1.5 Configurer Supabase Storage

**Storage → New Bucket :**
- Nom : `branding`
- Public bucket : ✅ Oui
- File size limit : `5 MB`
- Allowed MIME types : `image/*`

---

## ÉTAPE 2 — Services IA (10 min)

### OpenRouter (Minimum requis)

1. → [openrouter.ai](https://openrouter.ai) → Account → API Keys → Create Key
2. Copier → `OPENROUTER_API_KEY=sk-or-v1-...`
3. Note : Modèles gratuits disponibles (`openrouter/free`)

### Serper.dev (Sourcing réel)

1. → [serper.dev](https://serper.dev) → API Keys → Create
2. Copier → `SERPER_API_KEY=...`
3. Note : 100 recherches/mois gratuites

---

## ÉTAPE 3 — Nylas V3 — OAuth Email (20 min)

1. → [dashboard.nylas.com](https://dashboard.nylas.com) → New Application
2. Activer les providers : **Google** + **Microsoft**
3. Redirect URIs → Ajouter : `https://YOUR-APP.vercel.app/api/auth/nylas/callback`
4. Copier :
   - `Client ID` → `NYLAS_CLIENT_ID`
   - `Client Secret` → `NYLAS_CLIENT_SECRET`
5. `NYLAS_REDIRECT_URI=https://YOUR-APP.vercel.app/api/auth/nylas/callback`

> Sans Nylas → L'app fonctionne en mode mock OAuth (aucun crash)

---

## ÉTAPE 4 — Stripe — Facturation (30 min)

1. → [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys
2. Copier **Secret Key** → `STRIPE_SECRET_KEY=sk_test_...` (ou `sk_live_...` pour prod)

### Créer les produits

**Products → Add Product :**

| Nom | Prix | Intervalle | Variable |
|-----|------|-----------|---------|
| Starter Plan | $199 | Mensuel | `STRIPE_PRICE_SOLO` |
| Scale Plan | $499 | Mensuel | `STRIPE_PRICE_AGENCY` |

Copier les **Price IDs** (commencent par `price_...`)

### Configurer le webhook Stripe

**Developers → Webhooks → Add Endpoint :**
- URL : `https://YOUR-APP.vercel.app/api/webhooks/stripe`
- Events à écouter :
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copier **Signing Secret** → `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## ÉTAPE 5 — Services optionnels

| Service | Variable | Utilité | Gratuit |
|---------|----------|---------|--------|
| [Resend](https://resend.com) | `RESEND_API_KEY=re_...` | Emails transactionnels (invitations) | 3000/mois |
| [Sentry](https://sentry.io) | `NEXT_PUBLIC_SENTRY_DSN=https://...` | Monitoring erreurs | Oui |
| [PostHog](https://posthog.com) | `NEXT_PUBLIC_POSTHOG_KEY=phc_...` | Analytics produit | Oui |
| [Brevo](https://brevo.com) | Via Settings → Brevo dans l'app | Email marketing | 300/jour |

---

## ÉTAPE 6 — Déploiement Vercel (10 min)

### 6.1 Importer le repository

1. → [vercel.com](https://vercel.com) → **Add New Project**
2. Importer `Endsi3g/vectra-ai-saas-prospecting`
3. **Framework :** Next.js
4. **Root Directory :** `apps/web`

### 6.2 Variables d'environnement

Dans **Settings → Environment Variables**, ajouter :

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# IA — minimum 1 requis
OPENROUTER_API_KEY=sk-or-v1-...

# Email OAuth (optionnel, mock si absent)
NYLAS_CLIENT_ID=...
NYLAS_CLIENT_SECRET=...
NYLAS_REDIRECT_URI=https://YOUR-APP.vercel.app/api/auth/nylas/callback

# Stripe (optionnel, mock si absent)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_AGENCY=price_...

# Sourcing réel (optionnel, mock si absent)
SERPER_API_KEY=...

# Email transactionnel (optionnel)
RESEND_API_KEY=re_...

# Monitoring (optionnel)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# URL de l'app
NEXT_PUBLIC_SITE_URL=https://YOUR-APP.vercel.app
NODE_ENV=production
```

### 6.3 Déployer

Cliquer **Deploy** → Attendre 2-3 min → Copier l'URL Vercel

### 6.4 Post-déploiement

1. **Supabase Auth → Site URL** : mettre l'URL Vercel réelle
2. **Supabase Auth → Redirect URLs** : mettre l'URL Vercel + `/auth/callback`
3. **Nylas Dashboard** : mettre à jour le Redirect URI
4. **Stripe Webhook** : mettre à jour l'URL endpoint
5. Tester : `curl https://YOUR-APP.vercel.app/api/health`

---

## Vérifications post-déploiement

```bash
# 1. Health check
curl https://YOUR-APP.vercel.app/api/health
# Doit retourner : {"status":"ok","timestamp":"..."}

# 2. Vérifier les security headers
curl -I https://YOUR-APP.vercel.app
# Doit contenir : X-Frame-Options: DENY, X-Content-Type-Options: nosniff, etc.

# 3. Test bypass désactivé en production
curl https://YOUR-APP.vercel.app/app?bypass=true
# Doit rediriger vers /auth/sign-in (pas vers /app)

# 4. Test webhook Stripe (si Stripe CLI installé)
stripe trigger checkout.session.completed
# Doit retourner 200 (avec signature valide)
```

---

## Tests E2E locaux

```bash
cd apps/web

# Démarrer le serveur de test
npm run dev

# Dans un autre terminal
npx playwright test

# Avec UI
npx playwright test --ui

# Un test spécifique
npx playwright test --grep "Dashboard"
```

---

## Déploiement Supabase via CLI (optionnel)

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier le projet
supabase link --project-ref YOUR-PROJECT-REF

# Pousser toutes les migrations
supabase db push

# Vérifier l'état
supabase db diff
```

---

## Troubleshooting

| Problème | Cause probable | Solution |
|---------|---------------|---------|
| Page blanche après login | Supabase Redirect URL non configurée | Supabase Auth → Redirect URLs |
| "Supabase URL required" | Variables d'env manquantes | Vérifier Settings → Env Vars dans Vercel |
| Stripe webhook 400 | Signature incorrecte | Vérifier `STRIPE_WEBHOOK_SECRET` |
| Upload logo échoue | Bucket `branding` inexistant | Supabase Storage → Créer bucket |
| AI en mode mock | Pas de clé OpenRouter | Configurer `OPENROUTER_API_KEY` |
| Email d'invitation non reçu | `RESEND_API_KEY` manquante | Configurer Resend |
| `/api/training/chat` → 401 | Token non transmis | Vérifier que l'utilisateur est connecté |

---

## Architecture des environnements

```
Production (Vercel)
├── Branch: master → Auto-deploy
├── NODE_ENV=production
├── Sécurité: bypasses désactivés, cookies secure
└── URL: https://xxx.vercel.app

Preview (Vercel + Supabase Branching)
├── Branch: feature/* → Preview deploy
├── Supabase branch auto créée
└── URL: https://xxx-git-feature.vercel.app

Local Dev
├── npm run dev (port 3000)
├── .env.local avec vraies clés
└── E2E: E2E_TESTING=true npm run dev
```

---

*Vectra OS — Guide de déploiement v4.0 — 2026-05-21*
