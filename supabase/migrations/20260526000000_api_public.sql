-- Phase 8: API publique, rate limiting, webhooks sortants, request logs

-- ── Extend api_keys ───────────────────────────────────────────────────────────
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope       TEXT NOT NULL DEFAULT 'read_write' CHECK (scope IN ('read', 'write', 'read_write')),
  ADD COLUMN IF NOT EXISTS key_type    TEXT NOT NULL DEFAULT 'live' CHECK (key_type IN ('live', 'test')),
  ADD COLUMN IF NOT EXISTS is_active   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS expires_at  TIMESTAMPTZ;

-- ── api_request_logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id   UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  method       TEXT NOT NULL,
  path         TEXT NOT NULL,
  status_code  SMALLINT NOT NULL,
  latency_ms   INT,
  ip           TEXT,
  user_agent   TEXT,
  is_sandbox   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "request_logs_owner" ON public.api_request_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_api_logs_user_date ON public.api_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON public.api_request_logs(api_key_id);

-- ── webhook_endpoints ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  secret     TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  events     TEXT[] NOT NULL DEFAULT '{}',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_endpoints_owner" ON public.webhook_endpoints
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── webhook_deliveries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id  UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status_code  SMALLINT,
  response     TEXT,
  attempt      SMALLINT NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_deliveries_owner" ON public.webhook_deliveries
  FOR SELECT USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);

-- ── updated_at trigger for webhook_endpoints ──────────────────────────────────
DROP TRIGGER IF EXISTS trg_webhook_endpoints_updated_at ON public.webhook_endpoints;
CREATE TRIGGER trg_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
