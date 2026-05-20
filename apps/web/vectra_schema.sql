-- ============================================================
-- VECTRA OS — FULL SCHEMA INIT
-- Instructions: Coller dans Supabase Dashboard > SQL Editor > Run
-- Projet: xuzkfnpzmmtgpsjaiguv
-- ============================================================

-- ============================================================
-- 1. PROFILES (extension de auth.users, auto-créé via trigger)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  business_type TEXT DEFAULT 'SaaS',
  credits_count INTEGER DEFAULT 2000,
  credits_limit INTEGER DEFAULT 2000,
  tour_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  agent_config JSONB DEFAULT '{"hermes_active": true, "apollo_active": true, "athena_active": false, "match_threshold": 75, "max_leads_limit": 10}'::jsonb,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-créer un profil à chaque nouvel utilisateur Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Ma Campagne',
  business_type TEXT DEFAULT 'SaaS',
  offer TEXT,
  target_role TEXT,
  target_industry TEXT,
  target_location TEXT,
  tone TEXT DEFAULT 'professional',
  language TEXT DEFAULT 'fr',
  icp_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  website TEXT,
  email TEXT,
  notes TEXT,
  location TEXT,
  role TEXT,
  match_score INTEGER DEFAULT 75,
  saved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. MESSAGES (brouillons d'outreach)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  email_subject TEXT,
  email_body TEXT,
  linkedin_message TEXT,
  personalization_score INTEGER DEFAULT 95,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'discarded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. COLLECTIONS (dossiers de la bibliothèque)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. LEAD_COLLECTIONS (many-to-many leads ↔ collections)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_collections (
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, collection_id)
);

-- ============================================================
-- 7. FOLLOW_UPS (suivi de pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'prospect',
  follow_up_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. MAILBOXES (comptes email Nylas connectés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mailboxes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nylas_grant_id TEXT,
  email TEXT,
  provider TEXT DEFAULT 'google',
  connected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. INBOX_CONVERSATIONS (emails entrants analysés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inbox_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID REFERENCES public.mailboxes(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  thread_id TEXT UNIQUE,
  subject TEXT,
  from_email TEXT,
  from_name TEXT,
  snippet TEXT,
  sentiment TEXT DEFAULT 'neutral',
  sentiment_score NUMERIC DEFAULT 0.5,
  is_read BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. INBOX_MESSAGES (messages individuels du thread)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.inbox_conversations(id) ON DELETE CASCADE,
  nylas_message_id TEXT,
  body TEXT,
  from_email TEXT,
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Campaigns
CREATE POLICY "campaigns_all_own" ON public.campaigns FOR ALL USING (auth.uid() = user_id);

-- Leads: accès via campaign
CREATE POLICY "leads_all_own" ON public.leads FOR ALL
  USING (
    campaign_id IN (SELECT id FROM public.campaigns WHERE user_id = auth.uid())
    OR campaign_id IS NULL
  );

-- Messages: accès via lead → campaign
CREATE POLICY "messages_all_own" ON public.messages FOR ALL
  USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Collections
CREATE POLICY "collections_all_own" ON public.collections FOR ALL USING (auth.uid() = user_id);

-- Lead_collections: accès via lead
CREATE POLICY "lead_collections_all_own" ON public.lead_collections FOR ALL
  USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Follow_ups: accès via lead
CREATE POLICY "follow_ups_all_own" ON public.follow_ups FOR ALL
  USING (
    lead_id IN (
      SELECT l.id FROM public.leads l
      JOIN public.campaigns c ON l.campaign_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Mailboxes
CREATE POLICY "mailboxes_all_own" ON public.mailboxes FOR ALL USING (auth.uid() = user_id);

-- Inbox conversations: via mailbox
CREATE POLICY "inbox_conversations_all_own" ON public.inbox_conversations FOR ALL
  USING (
    mailbox_id IN (SELECT id FROM public.mailboxes WHERE user_id = auth.uid())
  );

-- Inbox messages: via conversation → mailbox
CREATE POLICY "inbox_messages_all_own" ON public.inbox_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT ic.id FROM public.inbox_conversations ic
      JOIN public.mailboxes m ON ic.mailbox_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

-- ============================================================
-- VERIFICATION — exécuter après pour confirmer
-- ============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
