-- ============================================================
-- VECTRA OS — SCHEMA UPDATE FOR INBOX
-- Instructions: Coller dans Supabase Dashboard > SQL Editor > Run
-- Projet: xuzkfnpzmmtgpsjaiguv
-- ============================================================

-- 1. Mettre à jour la table inbox_conversations
ALTER TABLE public.inbox_conversations 
ADD COLUMN IF NOT EXISTS nylas_thread_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_message_text TEXT;

-- 2. Mettre à jour la table inbox_messages
ALTER TABLE public.inbox_messages 
ADD COLUMN IF NOT EXISTS sender_type TEXT CHECK (sender_type IN ('prospect', 'user')),
ADD COLUMN IF NOT EXISTS snippet TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS magic_reply_draft TEXT;
