-- Add reasoning field to store chain-of-thought analysis from AI message generation
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reasoning TEXT;
