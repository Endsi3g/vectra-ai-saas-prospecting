import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/sequences/:id — sequence detail with steps
export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;

  const { id } = await params;

  if (ctx.isSandbox) {
    return NextResponse.json({
      data: { id, name: 'Mock Sequence', status: 'active', steps: [], sandbox: true },
    });
  }

  const { data, error } = await supabaseAdmin
    .from('sequences')
    .select('*, sequence_steps(*)')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  return NextResponse.json({ data });
}

// POST /api/v1/sequences/:id/enroll — enroll leads
export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  const { id } = await params;

  if (ctx.isSandbox) {
    return NextResponse.json({ enrolled: 1, sandbox: true }, { status: 201 });
  }

  const body = await req.json();
  const { lead_ids } = body as { lead_ids: string[] };
  if (!lead_ids?.length) return NextResponse.json({ error: 'lead_ids required' }, { status: 422 });

  const { data: seq } = await supabaseAdmin
    .from('sequences')
    .select('id, status, send_hour, sequence_steps(id, delay_days)')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .single();

  if (!seq) return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  if ((seq.status as string) !== 'active') return NextResponse.json({ error: 'Sequence must be active' }, { status: 422 });

  const steps = Array.isArray(seq.sequence_steps) ? seq.sequence_steps : [];
  if (!steps.length) return NextResponse.json({ error: 'Sequence has no steps' }, { status: 422 });

  const firstDelay = (steps[0] as { delay_days?: number })?.delay_days ?? 0;
  const nextSend = new Date();
  nextSend.setDate(nextSend.getDate() + firstDelay);
  nextSend.setHours(seq.send_hour as number, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .upsert(
      lead_ids.map((leadId: string) => ({
        sequence_id: id,
        lead_id: leadId,
        current_step: 0,
        status: 'active',
        next_send_at: nextSend.toISOString(),
      })),
      { onConflict: 'sequence_id,lead_id', ignoreDuplicates: true }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enrolled: data?.length ?? 0 }, { status: 201 });
}
