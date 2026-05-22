import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess, apiUnauthorized, apiBadRequest } from '@/lib/api-response';

export const runtime = 'nodejs';

// POST /api/sequences/[id]/enroll — enroll lead(s) in a sequence
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  const body = await req.json();
  const { lead_ids } = body as { lead_ids: string[] };
  if (!lead_ids?.length) return apiBadRequest('lead_ids requis.');

  // Verify sequence belongs to user
  const { data: seq } = await supabaseAdmin
    .from('sequences')
    .select('id, status, send_hour, sequence_steps(id)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!seq) return apiError('Séquence introuvable.', 404);
  if (seq.status !== 'active') return apiBadRequest('La séquence doit être active pour enrôler des leads.');
  const stepsCount = Array.isArray(seq.sequence_steps) ? seq.sequence_steps.length : 0;
  if (stepsCount === 0) return apiBadRequest("La séquence n'a aucun step.");

  // First step delay
  const { data: firstStep } = await supabaseAdmin
    .from('sequence_steps')
    .select('delay_days')
    .eq('sequence_id', id)
    .order('position')
    .limit(1)
    .single();

  const delayDays: number = (firstStep?.delay_days as number | undefined) ?? 0;
  const nextSend = computeNextSendAt(delayDays, seq.send_hour as number);

  const enrollments = lead_ids.map((lead_id: string) => ({
    sequence_id: id,
    lead_id,
    current_step: 0,
    status: 'active' as const,
    next_send_at: nextSend.toISOString(),
  }));

  const { data, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .upsert(enrollments, { onConflict: 'sequence_id,lead_id', ignoreDuplicates: true })
    .select();

  if (error) return apiError(error.message);

  // Create unsubscribe tokens for new enrollments
  if (data?.length) {
    await supabaseAdmin.from('unsubscribe_tokens').insert(
      data.map((e: { id: string; lead_id: string }) => ({ enrollment_id: e.id, lead_id: e.lead_id }))
    );
  }

  return NextResponse.json({ enrolled: data?.length ?? 0 }, { status: 201 });
}

function computeNextSendAt(delayDays: number, sendHour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + delayDays);
  d.setHours(sendHour, 0, 0, 0);
  return d;
}
