/* 1. Create public.workspaces table */
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

/* 2. Create public.profiles table if not exists */
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    business_type TEXT,
    preferred_languages TEXT[] DEFAULT '{}',
    tone TEXT CHECK (tone IN ('friendly', 'professional', 'formal')),
    onboarding_completed BOOLEAN DEFAULT false,
    tour_completed BOOLEAN DEFAULT false,
    google_connected BOOLEAN DEFAULT false,
    credits_count INTEGER DEFAULT 2000,
    credits_limit INTEGER DEFAULT 2000,
    plan TEXT DEFAULT 'alpha_free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    agent_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

/* 3. Ensure all profiles columns exist (handles existing tables) */
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS business_type TEXT,
    ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS tone TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS google_connected BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS credits_count INTEGER DEFAULT 2000,
    ADD COLUMN IF NOT EXISTS credits_limit INTEGER DEFAULT 2000,
    ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'alpha_free',
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS agent_config JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS brevo_api_key TEXT,
    ADD COLUMN IF NOT EXISTS brevo_sender_email TEXT,
    ADD COLUMN IF NOT EXISTS brevo_sender_name TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

/* Add constraint to profiles.tone if not exists */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_tone_check'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_tone_check CHECK (tone IN ('friendly', 'professional', 'formal'));
    END IF;
END $$;

/* 4. Create collections table */
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

/* 5. Create campaigns table */
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_type TEXT,
    offer TEXT,
    icp TEXT,
    angle TEXT,
    angle_description TEXT,
    call_to_action TEXT,
    extra_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS autopilot BOOLEAN NOT NULL DEFAULT false;

/* 6. Create leads table */
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT,
    company TEXT,
    website TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

/* 7. Create messages table */
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    language TEXT CHECK (language IN ('fr', 'en')),
    summary TEXT,
    email_subject TEXT,
    email_body TEXT,
    linkedin_message TEXT,
    personalization_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'discarded')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reasoning TEXT;

/* 8. Create mailboxes table */
CREATE TABLE IF NOT EXISTS public.mailboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    nylas_grant_id TEXT NOT NULL,
    status TEXT DEFAULT 'connected' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/* 9. Create inbox_conversations table */
CREATE TABLE IF NOT EXISTS public.inbox_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    mailbox_id UUID REFERENCES public.mailboxes(id) ON DELETE CASCADE NOT NULL,
    nylas_thread_id TEXT NOT NULL UNIQUE,
    sentiment TEXT DEFAULT 'interested' CHECK (sentiment IN ('interested', 'objection', 'unsubscribe')) NOT NULL,
    last_message_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/* 10. Create inbox_messages table */
CREATE TABLE IF NOT EXISTS public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.inbox_conversations(id) ON DELETE CASCADE NOT NULL,
    nylas_message_id TEXT NOT NULL UNIQUE,
    sender_type TEXT CHECK (sender_type IN ('user', 'prospect')) NOT NULL,
    body TEXT NOT NULL,
    snippet TEXT,
    subject TEXT,
    magic_reply_draft TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

/* 11. Create lead_collections table */
CREATE TABLE IF NOT EXISTS public.lead_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lead_id, collection_id)
);

/* 12. Create follow_ups table */
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'qualifie', 'message_envoye', 'reponse_recue', 'appel_planifie', 'deal_conclu')),
    follow_up_date DATE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lead_id)
);

/* 13. Create api_keys table */
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default Key',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope       TEXT NOT NULL DEFAULT 'read_write' CHECK (scope IN ('read', 'write', 'read_write')),
  ADD COLUMN IF NOT EXISTS key_type    TEXT NOT NULL DEFAULT 'live' CHECK (key_type IN ('live', 'test')),
  ADD COLUMN IF NOT EXISTS is_active   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;

/* 14. Create notifications table */
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inbox_reply', 'agent_cycle', 'brevo_sent', 'lead_added')),
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

/* 15. Create activity_logs table */
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent')),
  actor_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

/* 16. Create lead_comments table */
CREATE TABLE IF NOT EXISTS public.lead_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

/* 17. Create invitations table */
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/* 18. Create sequences tables */
CREATE TABLE IF NOT EXISTS public.sequences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id   UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  send_hour     SMALLINT NOT NULL DEFAULT 9 CHECK (send_hour BETWEEN 0 AND 23),
  timezone      TEXT NOT NULL DEFAULT 'Europe/Paris',
  is_template   BOOLEAN NOT NULL DEFAULT false,
  template_slug TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sequence_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
  position        SMALLINT NOT NULL DEFAULT 0,
  delay_days      SMALLINT NOT NULL DEFAULT 3 CHECK (delay_days >= 0),
  subject_a       TEXT NOT NULL DEFAULT '',
  subject_b       TEXT,
  body            TEXT NOT NULL DEFAULT '',
  ab_test_enabled BOOLEAN NOT NULL DEFAULT false,
  ab_winner       TEXT CHECK (ab_winner IN ('a','b')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, position)
);

CREATE TABLE IF NOT EXISTS public.sequence_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id       UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
  lead_id           UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  current_step      SMALLINT NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','stopped')),
  stop_reason       TEXT CHECK (stop_reason IN ('replied','unsubscribed','bounced','interested','manual')),
  next_send_at      TIMESTAMPTZ,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  UNIQUE (sequence_id, lead_id)
);

CREATE TABLE IF NOT EXISTS public.sequence_sends (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
  step_id        UUID NOT NULL REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
  lead_id        UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  subject_used   TEXT NOT NULL,
  body_used      TEXT NOT NULL,
  ab_variant     TEXT CHECK (ab_variant IN ('a','b')),
  nylas_message_id TEXT,
  sent_at        TIMESTAMPTZ,
  opened_at      TIMESTAMPTZ,
  clicked_at     TIMESTAMPTZ,
  replied_at     TIMESTAMPTZ,
  bounced_at     TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','opened','clicked','replied','bounced')),
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unsubscribe_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
  lead_id        UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  token          TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* 19. Create api_request_logs, webhooks tables */
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id   UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  method       TEXT NOT NULL,
  path         TEXT NOT NULL,
  status_code  SMALLINT NOT NULL,
  latency_ms   INT,
  ip           TEXT,
  user_agent   TEXT,
  is_sandbox   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  secret     TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  events     TEXT[] NOT NULL DEFAULT '{}',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id  UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status_code  SMALLINT,
  response     TEXT,
  attempt      SMALLINT NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* 20. Triggers and Functions */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_sequences_updated_at ON public.sequences;
CREATE TRIGGER trg_sequences_updated_at
  BEFORE UPDATE ON public.sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_webhook_endpoints_updated_at ON public.webhook_endpoints;
CREATE TRIGGER trg_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

/* 21. Row Level Security Policies */
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

/* Recreate policies with unique names, dropping older ones first */
DROP POLICY IF EXISTS "Users can access their own workspace" ON public.workspaces;
CREATE POLICY "Users can access their own workspace" ON public.workspaces
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.workspace_id = workspaces.id AND profiles.id = auth.uid()));

DROP POLICY IF EXISTS "Users can view and edit their own profiles" ON public.profiles;
CREATE POLICY "Users can view and edit their own profiles" ON public.profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own collections" ON public.collections;
CREATE POLICY "Users can manage their own collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage leads of their own campaigns" ON public.leads;
CREATE POLICY "Users can manage leads of their own campaigns" ON public.leads
  FOR ALL USING (EXISTS (SELECT 1 FROM public.campaigns WHERE public.campaigns.id = public.leads.campaign_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage messages of their own leads" ON public.messages;
CREATE POLICY "Users can manage messages of their own leads" ON public.messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.leads JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.leads.id = public.messages.lead_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own mailboxes" ON public.mailboxes;
CREATE POLICY "Users can manage their own mailboxes" ON public.mailboxes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage conversations of their own leads" ON public.inbox_conversations;
CREATE POLICY "Users can manage conversations of their own leads" ON public.inbox_conversations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.leads JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.leads.id = public.inbox_conversations.lead_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage messages of their own conversations" ON public.inbox_messages;
CREATE POLICY "Users can manage messages of their own conversations" ON public.inbox_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.inbox_conversations JOIN public.leads ON public.leads.id = public.inbox_conversations.lead_id JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.inbox_conversations.id = public.inbox_messages.conversation_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own lead_collections" ON public.lead_collections;
CREATE POLICY "Users can manage their own lead_collections" ON public.lead_collections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.leads JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.leads.id = public.lead_collections.lead_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage follow_ups of their own leads" ON public.follow_ups;
CREATE POLICY "Users can manage follow_ups of their own leads" ON public.follow_ups
  FOR ALL USING (EXISTS (SELECT 1 FROM public.leads JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.leads.id = public.follow_ups.lead_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage their own api_keys" ON public.api_keys;
CREATE POLICY "Users manage their own api_keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own notifications" ON public.notifications;
CREATE POLICY "Users manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own activity_logs" ON public.activity_logs;
CREATE POLICY "Users manage their own activity_logs" ON public.activity_logs
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage comments of their own leads" ON public.lead_comments;
CREATE POLICY "Users manage comments of their own leads" ON public.lead_comments
  FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.leads JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id WHERE public.leads.id = lead_comments.lead_id AND public.campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Workspace members can manage invitations" ON public.invitations;
CREATE POLICY "Workspace members can manage invitations" ON public.invitations
  FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "sequences_owner" ON public.sequences;
CREATE POLICY "sequences_owner" ON public.sequences
  USING (user_id = auth.uid() OR is_template = true)
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sequence_steps_owner" ON public.sequence_steps;
CREATE POLICY "sequence_steps_owner" ON public.sequence_steps
  USING (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid() OR is_template = true))
  WITH CHECK (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "sequence_enrollments_owner" ON public.sequence_enrollments;
CREATE POLICY "sequence_enrollments_owner" ON public.sequence_enrollments
  USING (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()))
  WITH CHECK (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "sequence_sends_owner" ON public.sequence_sends;
CREATE POLICY "sequence_sends_owner" ON public.sequence_sends
  USING (lead_id IN (SELECT l.id FROM public.leads l JOIN public.campaigns c ON l.campaign_id = c.id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS "unsubscribe_tokens_public_read" ON public.unsubscribe_tokens;
CREATE POLICY "unsubscribe_tokens_public_read" ON public.unsubscribe_tokens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "unsubscribe_tokens_owner_write" ON public.unsubscribe_tokens;
CREATE POLICY "unsubscribe_tokens_owner_write" ON public.unsubscribe_tokens
  USING (lead_id IN (SELECT l.id FROM public.leads l JOIN public.campaigns c ON l.campaign_id = c.id WHERE c.user_id = auth.uid()));

DROP POLICY IF EXISTS "request_logs_owner" ON public.api_request_logs;
CREATE POLICY "request_logs_owner" ON public.api_request_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "webhook_endpoints_owner" ON public.webhook_endpoints;
CREATE POLICY "webhook_endpoints_owner" ON public.webhook_endpoints
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "webhook_deliveries_owner" ON public.webhook_deliveries;
CREATE POLICY "webhook_deliveries_owner" ON public.webhook_deliveries
  FOR SELECT USING (user_id = auth.uid());

/* 22. Performance Indexes */
CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS messages_lead_id_idx ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS follow_ups_lead_id_idx ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(token);
CREATE INDEX IF NOT EXISTS invitations_workspace_id_idx ON public.invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next_send ON public.sequence_enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sequence_sends_step ON public.sequence_sends(step_id);
CREATE INDEX IF NOT EXISTS idx_sequences_user ON public.sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_date ON public.api_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON public.api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);

/* 23. Realtime replication setup */
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

/* 24. Built-in templates seed */
INSERT INTO public.sequences (user_id, name, description, is_template, template_slug, send_hour)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  t.name, t.description, true, t.slug, 9
FROM (VALUES
  ('Cold Outreach SaaS',     'Séquence 3 steps pour prospecter des SaaS B2B.',          'cold-saas'),
  ('Relance Agence',         'Séquence de relance pour une agence marketing/web.',       'relance-agence'),
  ('Partenariat BD',         'Approche partenariat et business development.',             'partenariat-bd'),
  ('Recrutement',            'Séquence de sourcing pour recruteurs.',                    'recrutement'),
  ('Consultant Freelance',   'Prospecter des missions en tant que consultant freelance.','consultant')
) AS t(name, description, slug)
ON CONFLICT (id) DO NOTHING;
