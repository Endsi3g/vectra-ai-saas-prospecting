/* Auto Workspace Creation Trigger */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_workspace_id UUID;
  workspace_slug TEXT;
BEGIN
  new_workspace_id := gen_random_uuid();
  workspace_slug := concat('workspace-', substring(new_workspace_id::text from 1 for 8));

  INSERT INTO public.workspaces (id, name, slug)
  VALUES (new_workspace_id, 'Mon Workspace', workspace_slug);

  INSERT INTO public.profiles (id, email, workspace_id, plan, credits_count, credits_limit, tour_completed)
  VALUES (NEW.id, NEW.email, new_workspace_id, 'alpha_free', 2000, 2000, false)
  ON CONFLICT (id) DO UPDATE
  SET workspace_id = new_workspace_id,
      plan = 'alpha_free',
      credits_count = 2000,
      credits_limit = 2000,
      tour_completed = false;

  RETURN NEW;
END;
$$;
