import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const VALID_EVENTS = [
  'lead.created', 'lead.updated', 'lead.deleted',
  'message.generated', 'message.approved', 'message.sent',
  'sequence.step_sent', 'sequence.completed', 'sequence.stopped',
  'inbox.reply_received', 'inbox.sentiment_changed',
];

// GET /api/v1/webhooks — list webhook endpoints
export async function GET(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: [], sandbox: true });
  }

  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .select('id, url, events, is_active, description, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/v1/webhooks — register webhook endpoint
export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: { id: crypto.randomUUID(), url: 'https://sandbox.example.com/webhook', sandbox: true } }, { status: 201 });
  }

  const body = await req.json();
  const { url, events, description } = body as { url: string; events: string[]; description?: string };

  if (!url?.startsWith('https://')) {
    return NextResponse.json({ error: 'url must be a valid HTTPS URL' }, { status: 422 });
  }
  if (!events?.length) {
    return NextResponse.json({ error: 'events array is required' }, { status: 422 });
  }
  const invalidEvents = events.filter((e) => !VALID_EVENTS.includes(e));
  if (invalidEvents.length) {
    return NextResponse.json({ error: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${VALID_EVENTS.join(', ')}` }, { status: 422 });
  }

  // Limit to 10 webhooks per user
  const { count } = await supabaseAdmin
    .from('webhook_endpoints')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId);
  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Maximum 10 webhook endpoints per account' }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .insert({ user_id: ctx.userId, url, events, description: description ?? null })
    .select('id, url, events, is_active, description, secret, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

// DELETE /api/v1/webhooks — delete all (or use ?id=xxx)
export async function DELETE(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 422 });

  const { error } = await supabaseAdmin
    .from('webhook_endpoints')
    .delete()
    .eq('id', id)
    .eq('user_id', ctx.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
