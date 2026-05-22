import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';

export const runtime = 'nodejs';

/**
 * @openapi
 * /api/v1/leads:
 *   get:
 *     summary: List leads
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: campaign_id
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         description: Search by name, email or company
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  const { searchParams } = req.nextUrl;
  const campaignId = searchParams.get('campaign_id');
  const q = searchParams.get('q');
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);
  const offset = Number(searchParams.get('offset') ?? 0);

  // Sandbox: return mock data
  if (ctx.isSandbox) {
    return NextResponse.json({
      data: MOCK_LEADS,
      total: MOCK_LEADS.length,
      limit,
      offset,
      sandbox: true,
    });
  }

  let query = supabaseAdmin
    .from('leads')
    .select('id, first_name, last_name, email, company, title, linkedin_url, score, status, created_at', { count: 'exact' })
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (campaignId) query = query.eq('campaign_id', campaignId);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count ?? 0, limit, offset });
}

/**
 * @openapi
 * /api/v1/leads:
 *   post:
 *     summary: Create one or multiple leads (bulk)
 *     tags: [Leads]
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  if (ctx.isSandbox) {
    return NextResponse.json({ data: [{ ...MOCK_LEADS[0], id: crypto.randomUUID() }], sandbox: true }, { status: 201 });
  }

  const body = await req.json();
  const leads = Array.isArray(body) ? body : [body];

  if (leads.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 leads per request' }, { status: 422 });
  }

  const toInsert = leads.map((l: Record<string, unknown>) => ({
    user_id: ctx.userId,
    first_name: l.first_name ?? null,
    last_name: l.last_name ?? null,
    email: (l.email as string | undefined)?.toLowerCase() ?? null,
    company: l.company ?? null,
    title: l.title ?? null,
    linkedin_url: l.linkedin_url ?? null,
    campaign_id: l.campaign_id ?? null,
    score: l.score ?? null,
    status: 'sourced',
    source: 'api',
  }));

  const { data, error } = await supabaseAdmin.from('leads').insert(toInsert).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Dispatch webhooks
  for (const lead of (data ?? [])) {
    void dispatchWebhook(ctx.userId, 'lead.created', lead as Record<string, unknown>);
  }

  return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 });
}

// ── Mock data for sandbox ─────────────────────────────────────────────────────

const MOCK_LEADS = [
  { id: 'mock-lead-1', first_name: 'Alice', last_name: 'Martin', email: 'alice@startup.io', company: 'Startup SAS', title: 'CEO', score: 88, status: 'sourced', created_at: new Date().toISOString() },
  { id: 'mock-lead-2', first_name: 'Bob', last_name: 'Dupont', email: 'bob@scale.co', company: 'Scale Corp', title: 'CTO', score: 74, status: 'contacted', created_at: new Date().toISOString() },
  { id: 'mock-lead-3', first_name: 'Claire', last_name: 'Bernard', email: 'claire@agency.fr', company: 'Agency Pro', title: 'Head of Sales', score: 91, status: 'interested', created_at: new Date().toISOString() },
];
