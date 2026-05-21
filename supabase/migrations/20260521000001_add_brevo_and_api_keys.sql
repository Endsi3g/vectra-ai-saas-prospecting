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

-- Check if policy already exists before creating it (just in case)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_keys' AND policyname = 'Users manage their own api_keys'
    ) THEN
        CREATE POLICY "Users manage their own api_keys"
          ON public.api_keys FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

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

-- Check if policy already exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users manage their own notifications'
    ) THEN
        CREATE POLICY "Users manage their own notifications"
          ON public.notifications FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;
