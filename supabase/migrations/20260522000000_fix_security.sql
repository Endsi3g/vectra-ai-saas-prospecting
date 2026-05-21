-- Fix RLS on workspaces: restrict access to members only (was USING (true))
DROP POLICY IF EXISTS "Users can manage workspaces they are part of" ON public.workspaces;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace members can access their workspace" ON public.workspaces;

CREATE POLICY "Users can access their own workspace"
  ON public.workspaces FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.workspace_id = workspaces.id
        AND profiles.id = auth.uid()
    )
  );

-- Ensure RLS is enabled on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
