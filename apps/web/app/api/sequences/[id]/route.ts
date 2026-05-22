import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess, apiUnauthorized, apiNotFound } from '@/lib/api-response';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/sequences/[id]
export async function GET(req: NextRequest, { params }: Ctx) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('sequences')
    .select(`
      *,
      sequence_steps(*),
      sequence_enrollments(id, status, lead_id, current_step, next_send_at, enrolled_at, stop_reason)
    `)
    .eq('id', id)
    .or(`user_id.eq.${user.id},is_template.eq.true`)
    .single();

  if (error || !data) return apiNotFound('Séquence introuvable.');
  return apiSuccess(data);
}

// PUT /api/sequences/[id]
export async function PUT(req: NextRequest, { params }: Ctx) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  const body = await req.json();
  const { name, description, status, send_hour, timezone, campaign_id, steps } = body;

  const updatePayload: Record<string, unknown> = {};
  if (name !== undefined) updatePayload.name = name;
  if (description !== undefined) updatePayload.description = description;
  if (status !== undefined) updatePayload.status = status;
  if (send_hour !== undefined) updatePayload.send_hour = send_hour;
  if (timezone !== undefined) updatePayload.timezone = timezone;
  if (campaign_id !== undefined) updatePayload.campaign_id = campaign_id;

  const { error } = await supabaseAdmin
    .from('sequences')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return apiError(error.message);

  // Replace all steps if provided
  if (Array.isArray(steps)) {
    await supabaseAdmin.from('sequence_steps').delete().eq('sequence_id', id);
    if (steps.length > 0) {
      await supabaseAdmin.from('sequence_steps').insert(
        steps.map((s: Record<string, unknown>, i: number) => ({
          sequence_id: id,
          position: i,
          delay_days: s.delay_days ?? 3,
          subject_a: s.subject_a ?? '',
          subject_b: s.subject_b ?? null,
          body: s.body ?? '',
          ab_test_enabled: s.ab_test_enabled ?? false,
        }))
      );
    }
  }

  const { data: updated } = await supabaseAdmin
    .from('sequences')
    .select('*, sequence_steps(*)')
    .eq('id', id)
    .single();

  return apiSuccess(updated);
}

// DELETE /api/sequences/[id]
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('sequences')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return apiError(error.message);
  return apiSuccess({ deleted: true });
}
