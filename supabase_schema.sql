-- Create public.workspaces table
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workspaces they are part of"
    ON public.workspaces
    FOR ALL
    USING (true);

-- Create public.profiles table
CREATE TABLE public.profiles (
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

-- Create collections table
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collections"
    ON public.collections
    FOR ALL
    USING (auth.uid() = user_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own profiles"
    ON public.profiles
    FOR ALL
    USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Create campaigns table
CREATE TABLE public.campaigns (
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

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns"
    ON public.campaigns
    FOR ALL
    USING (auth.uid() = user_id);


-- Create leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT,
    company TEXT,
    website TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage leads of their own campaigns"
    ON public.leads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE public.campaigns.id = public.leads.campaign_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create messages table
CREATE TABLE public.messages (
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

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages of their own leads"
    ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.leads.id = public.messages.lead_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create mailboxes table (Phase 11)
CREATE TABLE public.mailboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL, -- 'gmail', 'outlook', 'imap'
    nylas_grant_id TEXT NOT NULL, -- Nylas Access Grant ID
    status TEXT DEFAULT 'connected' NOT NULL, -- 'connected', 'error'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on mailboxes
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mailboxes"
    ON public.mailboxes
    FOR ALL
    USING (auth.uid() = user_id);


-- Create inbox_conversations table (Phase 11)
CREATE TABLE public.inbox_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    mailbox_id UUID REFERENCES public.mailboxes(id) ON DELETE CASCADE NOT NULL,
    nylas_thread_id TEXT NOT NULL UNIQUE,
    sentiment TEXT DEFAULT 'interested' CHECK (sentiment IN ('interested', 'objection', 'unsubscribe')) NOT NULL,
    last_message_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on inbox_conversations
ALTER TABLE public.inbox_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage conversations of their own leads"
    ON public.inbox_conversations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.leads.id = public.inbox_conversations.lead_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create inbox_messages table (Phase 11)
CREATE TABLE public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.inbox_conversations(id) ON DELETE CASCADE NOT NULL,
    nylas_message_id TEXT NOT NULL UNIQUE,
    sender_type TEXT CHECK (sender_type IN ('user', 'prospect')) NOT NULL,
    body TEXT NOT NULL,
    snippet TEXT,
    subject TEXT,
    magic_reply_draft TEXT, -- Pre-generated IA magic reply
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on inbox_messages
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages of their own conversations"
    ON public.inbox_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.inbox_conversations
            JOIN public.leads ON public.leads.id = public.inbox_conversations.lead_id
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.inbox_conversations.id = public.inbox_messages.conversation_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create lead_collections junction table (many-to-many: leads ↔ collections)
CREATE TABLE public.lead_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lead_id, collection_id)
);

-- Enable RLS on lead_collections
ALTER TABLE public.lead_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lead_collections"
    ON public.lead_collections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.leads.id = public.lead_collections.lead_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create follow_ups table
CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'qualifie', 'message_envoye', 'reponse_recue', 'appel_planifie', 'deal_conclu')),
    follow_up_date DATE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lead_id)
);

-- Enable RLS on follow_ups
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage follow_ups of their own leads"
    ON public.follow_ups
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.leads.id = public.follow_ups.lead_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Add agent_config column to profiles for storing agent preferences
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS agent_config JSONB DEFAULT '{}'::jsonb;

-- Add email column to profiles (mirrors auth.users.email for convenience)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email TEXT;

-- Brevo config on workspace-level (shared, stored per user who is the workspace admin)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS brevo_api_key TEXT,
  ADD COLUMN IF NOT EXISTS brevo_sender_email TEXT,
  ADD COLUMN IF NOT EXISTS brevo_sender_name TEXT;

-- API keys table (secure: stores hash, not raw key)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,  -- e.g. "vt_live_92hf"
  name TEXT NOT NULL DEFAULT 'Default Key',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own api_keys"
  ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- Notifications table
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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Phase 3 updates: Add autopilot config to campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS autopilot BOOLEAN NOT NULL DEFAULT false;

-- Create activity_logs table for autonomous agent activity tracker
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
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own activity_logs"
  ON public.activity_logs FOR ALL USING (auth.uid() = user_id);

-- Create lead_comments table for team discussion
CREATE TABLE IF NOT EXISTS public.lead_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage comments of their own leads"
  ON public.lead_comments FOR ALL USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.leads
      JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
      WHERE public.leads.id = lead_comments.lead_id
        AND public.campaigns.user_id = auth.uid()
    )
  );

