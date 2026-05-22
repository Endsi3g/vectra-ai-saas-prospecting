-- Add expo_push_token to profiles for mobile push notifications
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
