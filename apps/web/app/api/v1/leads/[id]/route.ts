import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: { id: params.id, first_name: 'Alice', last_name: 'Martin', email: 'alice@startup.io', company: 'Startup SAS', score: 88, sandbox: true } });
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', ctx.userId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) return NextResponse.json({ data: { id: params.id, updated: true, sandbox: true } });

  const body = await req.json();
  const allowed = ['first_name', 'last_name', 'email', 'company', 'title', 'linkedin_url', 'score', 'status', 'campaign_id'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', ctx.userId)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: 'Lead not found or update failed' }, { status: 404 });
  void dispatchWebhook(ctx.userId, 'lead.updated', data as Record<string, unknown>);
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) return NextResponse.json({ deleted: true, sandbox: true });

  const { error } = await supabaseAdmin
    .from('leads')
    .delete()
    .eq('id', params.id)
    .eq('user_id', ctx.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  void dispatchWebhook(ctx.userId, 'lead.deleted', { id: params.id });
  return NextResponse.json({ deleted: true });
}
