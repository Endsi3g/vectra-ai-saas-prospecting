import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: MOCK_CAMPAIGNS, total: MOCK_CAMPAIGNS.length, sandbox: true });
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
  const offset = Number(searchParams.get('offset') ?? 0);

  const { data, error, count } = await supabaseAdmin
    .from('campaigns')
    .select('id, name, offer, icp, angle, status, created_at', { count: 'exact' })
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, limit, offset });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: { id: crypto.randomUUID(), name: 'Mock Campaign', sandbox: true } }, { status: 201 });
  }

  const body = await req.json();
  const { name, offer, icp, angle, business_type } = body as Record<string, string>;
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 422 });

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({ user_id: ctx.userId, name: name.trim(), offer, icp, angle, business_type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

const MOCK_CAMPAIGNS = [
  { id: 'mock-campaign-1', name: 'Cold Outreach SaaS Q3', offer: 'Vectra API', icp: 'SaaS B2B', status: 'active', created_at: new Date().toISOString() },
];
