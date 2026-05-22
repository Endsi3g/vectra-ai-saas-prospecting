import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess, apiUnauthorized } from '@/lib/api-response';

export const runtime = 'nodejs';

// GET /api/sequences/[id]/stats — stats per step + heatmap + timeline
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { data: seq } = await supabaseAdmin
    .from('sequences')
    .select('id, name, status, send_hour, sequence_steps(id, position)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (!seq) return apiError('Séquence introuvable.', 404);

  const steps = Array.isArray(seq.sequence_steps) ? seq.sequence_steps : [];
  const stepIds: string[] = steps.map((s: { id: string }) => s.id);

  // Fetch sends for all steps
  const { data: sends } = stepIds.length
    ? await supabaseAdmin
        .from('sequence_sends')
        .select('id, step_id, status, ab_variant, sent_at, opened_at, replied_at, bounced_at')
        .in('step_id', stepIds)
    : { data: [] };

  // Fetch steps details
  const { data: stepDetails } = await supabaseAdmin
    .from('sequence_steps')
    .select('id, position, subject_a, subject_b, delay_days, ab_test_enabled, ab_winner')
    .eq('sequence_id', params.id)
    .order('position');

  type Send = {
    id: string; step_id: string; status: string; ab_variant: string | null;
    sent_at: string | null; opened_at: string | null; replied_at: string | null; bounced_at: string | null;
  };

  const allSends: Send[] = (sends ?? []) as Send[];

  const stepStats = (stepDetails ?? []).map((step: {
    id: string; position: number; subject_a: string; subject_b: string | null;
    delay_days: number; ab_test_enabled: boolean; ab_winner: string | null;
  }) => {
    const stepSends = allSends.filter((s) => s.step_id === step.id);
    const sent = stepSends.filter((s) => !['queued', 'failed'].includes(s.status)).length;
    const opened = stepSends.filter((s) => s.opened_at).length;
    const replied = stepSends.filter((s) => s.replied_at).length;
    const bounced = stepSends.filter((s) => s.bounced_at).length;
    const aVariant = stepSends.filter((s) => s.ab_variant === 'a');
    const bVariant = stepSends.filter((s) => s.ab_variant === 'b');

    return {
      step_id: step.id,
      position: step.position,
      subject_a: step.subject_a,
      subject_b: step.subject_b,
      ab_test_enabled: step.ab_test_enabled,
      ab_winner: step.ab_winner,
      delay_days: step.delay_days,
      total_queued: stepSends.length,
      total_sent: sent,
      open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      reply_rate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
      bounce_rate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
      ab_a_open_rate: aVariant.length > 0 ? Math.round((aVariant.filter((s) => s.opened_at).length / aVariant.length) * 100) : null,
      ab_b_open_rate: bVariant.length > 0 ? Math.round((bVariant.filter((s) => s.opened_at).length / bVariant.length) * 100) : null,
    };
  });

  // Heatmap
  const heatmap = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  allSends.forEach((s) => {
    if (s.opened_at) {
      const h = new Date(s.opened_at).getHours();
      if (heatmap[h]) heatmap[h].count++;
    }
  });

  // Enrollments
  const { data: enrollments } = await supabaseAdmin
    .from('sequence_enrollments')
    .select('id, status, stop_reason, current_step, enrolled_at, completed_at, lead_id')
    .eq('sequence_id', params.id)
    .order('enrolled_at', { ascending: false });

  const enr = enrollments ?? [];
  type Enrollment = typeof enr[number];

  const summary = {
    total_enrolled: enr.length,
    active: enr.filter((e: Enrollment) => e.status === 'active').length,
    completed: enr.filter((e: Enrollment) => e.status === 'completed').length,
    stopped: enr.filter((e: Enrollment) => e.status === 'stopped').length,
  };

  return apiSuccess({ sequence: seq, summary, steps: stepStats, heatmap, enrollments: enr });
}
