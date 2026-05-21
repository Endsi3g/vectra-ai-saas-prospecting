-- Add autopilot configuration option to campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS autopilot BOOLEAN NOT NULL DEFAULT false;

-- Create activity_logs table for autonomous agent activity tracker
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent')),
  actor_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,  -- e.g. 'lead_qualified', 'email_drafted', 'email_sent', 'comment_added'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Check and create policy for activity_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_logs' AND policyname = 'Users manage their own activity_logs'
    ) THEN
        CREATE POLICY "Users manage their own activity_logs"
          ON public.activity_logs FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

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

-- Check and create policy for lead_comments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lead_comments' AND policyname = 'Users manage comments of their own leads'
    ) THEN
        CREATE POLICY "Users manage comments of their own leads"
          ON public.lead_comments FOR ALL USING (
            auth.uid() = user_id OR EXISTS (
              SELECT 1 FROM public.leads
              JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
              WHERE public.leads.id = lead_comments.lead_id
                AND public.campaigns.user_id = auth.uid()
            )
          );
    END IF;
END
$$;

-- Enable Realtime replication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
