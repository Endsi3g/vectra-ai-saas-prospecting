-- Phase 7: Email Sequences (multi-step automated campaigns)

-- ── sequences ────────────────────────────────────────────────────────────────
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

-- ── sequence_steps ────────────────────────────────────────────────────────────
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

-- ── sequence_enrollments ──────────────────────────────────────────────────────
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

-- ── sequence_sends ────────────────────────────────────────────────────────────
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

-- ── unsubscribe_tokens ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.unsubscribe_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
  lead_id        UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  token          TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.sequences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_sends      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsubscribe_tokens  ENABLE ROW LEVEL SECURITY;

-- sequences: owned by user (templates visible to all)
CREATE POLICY "sequences_owner" ON public.sequences
  USING (user_id = auth.uid() OR is_template = true)
  WITH CHECK (user_id = auth.uid());

-- steps: via sequence ownership
CREATE POLICY "sequence_steps_owner" ON public.sequence_steps
  USING (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid() OR is_template = true))
  WITH CHECK (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()));

-- enrollments: via sequence ownership
CREATE POLICY "sequence_enrollments_owner" ON public.sequence_enrollments
  USING (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()))
  WITH CHECK (sequence_id IN (SELECT id FROM public.sequences WHERE user_id = auth.uid()));

-- sends: via enrollment ownership
CREATE POLICY "sequence_sends_owner" ON public.sequence_sends
  USING (lead_id IN (SELECT id FROM public.leads WHERE user_id = auth.uid()));

-- unsubscribe tokens: anyone can read (needed for public unsubscribe page)
CREATE POLICY "unsubscribe_tokens_public_read" ON public.unsubscribe_tokens
  FOR SELECT USING (true);
CREATE POLICY "unsubscribe_tokens_owner_write" ON public.unsubscribe_tokens
  USING (lead_id IN (SELECT id FROM public.leads WHERE user_id = auth.uid()));

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next_send ON public.sequence_enrollments(next_send_at)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sequence_sends_step ON public.sequence_sends(step_id);
CREATE INDEX IF NOT EXISTS idx_sequences_user ON public.sequences(user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_sequences_updated_at ON public.sequences;
CREATE TRIGGER trg_sequences_updated_at
  BEFORE UPDATE ON public.sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── 5 built-in templates ─────────────────────────────────────────────────────
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
ON CONFLICT DO NOTHING;
