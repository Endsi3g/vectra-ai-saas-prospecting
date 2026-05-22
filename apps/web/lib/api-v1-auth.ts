// Authenticate and authorize a v1 API request.
// Returns the resolved context or a Response to return immediately.

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';
import { checkRateLimit, rateLimitHeaders } from './api-rate-limiter';

export interface ApiContext {
  userId: string;
  keyId: string;
  plan: string;
  isSandbox: boolean;
  scope: string;
}

const MOCK_SANDBOX_USER = '00000000-0000-0000-0000-000000000001';

export async function authenticateV1(
  req: NextRequest,
): Promise<{ ctx: ApiContext } | { error: NextResponse }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Missing Authorization header. Use: Bearer vt_live_xxx or Bearer vt_test_xxx' }, { status: 401 }) };
  }

  const token = authHeader.slice(7);
  const isSandbox = token.startsWith('vt_test_');
  const isLive = token.startsWith('vt_live_');

  if (!isSandbox && !isLive) {
    return { error: NextResponse.json({ error: 'Invalid API key format. Keys must start with vt_live_ or vt_test_' }, { status: 401 }) };
  }

  // Sandbox shortcut — return mock context, no DB call, no credits consumed
  if (isSandbox) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: key } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, scope, is_active')
      .eq('key_hash', hash)
      .eq('key_type', 'test')
      .single();

    if (!key?.is_active) {
      return { error: NextResponse.json({ error: 'Invalid or revoked test API key' }, { status: 401 }) };
    }

    return {
      ctx: {
        userId: key.user_id as string,
        keyId: key.id as string,
        plan: 'sandbox',
        isSandbox: true,
        scope: (key.scope as string) ?? 'read_write',
      },
    };
  }

  // Live key
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const { data: key } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, scope, is_active, expires_at')
    .eq('key_hash', hash)
    .eq('key_type', 'live')
    .single();

  if (!key?.is_active) {
    return { error: NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 }) };
  }

  if (key.expires_at && new Date(key.expires_at as string) < new Date()) {
    return { error: NextResponse.json({ error: 'API key expired' }, { status: 401 }) };
  }

  // Fetch user plan
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', key.user_id)
    .single();
  const plan = (profile?.plan as string) ?? 'free';

  // Rate limit check
  const rl = checkRateLimit(key.id as string, plan);
  if (!rl.allowed) {
    return {
      error: NextResponse.json(
        { error: 'Rate limit exceeded', retry_after: Math.ceil((rl.resetAt - Date.now()) / 1000) },
        { status: 429, headers: rateLimitHeaders(rl) }
      ),
    };
  }

  // Background: update last_used_at + log request
  void logRequest(req, key.user_id as string, key.id as string, false);

  return {
    ctx: {
      userId: key.user_id as string,
      keyId: key.id as string,
      plan,
      isSandbox: false,
      scope: (key.scope as string) ?? 'read_write',
    },
  };
}

// Log request asynchronously (fire-and-forget)
export async function logRequest(
  req: NextRequest,
  userId: string,
  keyId: string,
  isSandbox: boolean,
  statusCode = 200,
  latencyMs?: number,
) {
  try {
    await supabaseAdmin.from('api_request_logs').insert({
      user_id: userId,
      api_key_id: keyId,
      method: req.method,
      path: new URL(req.url).pathname,
      status_code: statusCode,
      latency_ms: latencyMs ?? null,
      ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent')?.slice(0, 256),
      is_sandbox: isSandbox,
    });
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);
  } catch {
    // non-critical
  }
}

export function writeRequired(ctx: ApiContext): NextResponse | null {
  if (ctx.scope === 'read') {
    return NextResponse.json({ error: 'This API key is read-only. Create a read_write key to use this endpoint.' }, { status: 403 });
  }
  return null;
}
