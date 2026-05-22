import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const VALID_EVENTS = [
  'lead.created', 'lead.updated', 'lead.deleted',
  'message.generated', 'message.approved', 'message.sent',
  'sequence.step_sent', 'sequence.completed', 'sequence.stopped',
  'inbox.reply_received', 'inbox.sentiment_changed',
];

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .select('id, url, events, is_active, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ endpoints: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { url, events, description } = body as { url: string; events: string[]; description?: string };

  if (!url?.startsWith('https://')) return NextResponse.json({ error: 'URL doit commencer par https://' }, { status: 422 });
  if (!events?.length) return NextResponse.json({ error: 'Au moins un événement requis' }, { status: 422 });
  const invalid = events.filter((e) => !VALID_EVENTS.includes(e));
  if (invalid.length) return NextResponse.json({ error: `Événements invalides: ${invalid.join(', ')}` }, { status: 422 });

  const { count } = await supabaseAdmin
    .from('webhook_endpoints')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if ((count ?? 0) >= 10) return NextResponse.json({ error: 'Maximum 10 webhooks par compte' }, { status: 422 });

  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .insert({ user_id: user.id, url, events, description: description ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 422 });

  const { error } = await supabaseAdmin
    .from('webhook_endpoints')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
