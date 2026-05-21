-- Add enriched fields to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add logo_url to profiles for branding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Performance indexes
CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS messages_lead_id_idx ON public.messages(lead_id);
CREATE INDEX IF NOT EXISTS follow_ups_lead_id_idx ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS leads_workspace_id_idx ON public.leads(workspace_id);
