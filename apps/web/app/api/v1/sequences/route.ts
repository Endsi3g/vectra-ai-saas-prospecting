import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: MOCK_SEQS, total: MOCK_SEQS.length, sandbox: true });
  }

  const { data, error, count } = await supabaseAdmin
    .from('sequences')
    .select('id, name, status, send_hour, campaign_id, created_at, sequence_steps(count)', { count: 'exact' })
    .eq('user_id', ctx.userId)
    .eq('is_template', false)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: { id: crypto.randomUUID(), name: 'Mock Sequence', sandbox: true } }, { status: 201 });
  }

  const body = await req.json();
  const { name, send_hour = 9, campaign_id } = body as Record<string, unknown>;
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 422 });

  const { data, error } = await supabaseAdmin
    .from('sequences')
    .insert({ user_id: ctx.userId, name, send_hour, campaign_id: campaign_id ?? null, status: 'draft' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

const MOCK_SEQS = [
  { id: 'mock-seq-1', name: 'Cold SaaS Sequence', status: 'active', send_hour: 9, created_at: new Date().toISOString() },
];
