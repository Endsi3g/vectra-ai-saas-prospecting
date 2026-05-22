import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess } from '@/lib/api-response';

export const runtime = 'nodejs';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepData {
  id: string;
  position: number;
  delay_days: number;
  subject_a: string;
  subject_b: string | null;
  body: string;
  ab_test_enabled: boolean;
  ab_winner: string | null;
}

interface SequenceData {
  id: string;
  send_hour: number;
  timezone: string;
  user_id: string;
  sequence_steps: StepData[];
}

interface LeadData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
}

interface EnrollmentRow {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step: number;
  sequences: SequenceData | null;
  leads: LeadData | null;
}

// POST /api/sequences/process — Vercel Cron handler (every 15 min)
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return apiError('Unauthorized', 401);
  }

  const now = new Date().toISOString();

  // Find active enrollments that are due
  const { data: due, error } = await supabaseAdmin
    .from('sequence_enrollments')
    .select(`
      id, lead_id, sequence_id, current_step,
      sequences(id, send_hour, timezone, user_id,
        sequence_steps(id, position, delay_days, subject_a, subject_b, body, ab_test_enabled, ab_winner)
      ),
      leads(id, first_name, last_name, email, company)
    `)
    .eq('status', 'active')
    .lte('next_send_at', now)
    .not('next_send_at', 'is', null)
    .limit(50);

  if (error) return apiError(error.message);
  if (!due?.length) return apiSuccess({ processed: 0 });

  let processed = 0;
  let failed = 0;

  for (const rawRow of due) {
    const enrollment = rawRow as unknown as EnrollmentRow;
    try {
      const seq = enrollment.sequences;
      if (!seq) continue;

      const steps = [...(seq.sequence_steps ?? [])].sort((a, b) => a.position - b.position);
      const stepIndex = enrollment.current_step;
      const currentStep = steps[stepIndex];
      if (!currentStep) {
        await supabaseAdmin.from('sequence_enrollments').update({
          status: 'completed',
          completed_at: now,
          next_send_at: null,
        }).eq('id', enrollment.id);
        continue;
      }

      const lead = enrollment.leads;
      if (!lead) continue;

      // Choose A/B variant
      let variant: 'a' | 'b' = 'a';
      let subjectUsed = currentStep.subject_a;
      if (currentStep.ab_test_enabled && currentStep.subject_b) {
        if (currentStep.ab_winner) {
          variant = currentStep.ab_winner as 'a' | 'b';
          subjectUsed = variant === 'a' ? currentStep.subject_a : currentStep.subject_b;
        } else {
          variant = enrollment.id.slice(-1) < '8' ? 'a' : 'b';
          subjectUsed = variant === 'a' ? currentStep.subject_a : (currentStep.subject_b ?? currentStep.subject_a);
        }
      }

      const bodyUsed = personalizeEmail(currentStep.body, lead);
      const subjectPersonalized = personalizeEmail(subjectUsed, lead);

      const { data: sendRecord } = await supabaseAdmin
        .from('sequence_sends')
        .insert({
          enrollment_id: enrollment.id,
          step_id: currentStep.id,
          lead_id: lead.id,
          subject_used: subjectPersonalized,
          body_used: bodyUsed,
          ab_variant: variant,
          status: 'queued',
        })
        .select()
        .single();

      const { data: nylasConn } = await supabaseAdmin
        .from('nylas_connections')
        .select('grant_id, email')
        .eq('user_id', seq.user_id)
        .limit(1)
        .single();

      let nylasMessageId: string | null = null;
      if (nylasConn?.grant_id && lead.email) {
        try {
          nylasMessageId = await sendViaEmail({
            grantId: nylasConn.grant_id as string,
            from: nylasConn.email as string,
            to: lead.email,
            subject: subjectPersonalized,
            body: bodyUsed,
          });
        } catch (err) {
          console.warn(`[sequences] Nylas send failed for enrollment ${enrollment.id}:`, err);
        }
      }

      if (sendRecord) {
        await supabaseAdmin
          .from('sequence_sends')
          .update({
            status: nylasMessageId ? 'sent' : 'failed',
            nylas_message_id: nylasMessageId,
            sent_at: nylasMessageId ? now : null,
            error_message: nylasMessageId ? null : 'Nylas send failed or not configured',
          })
          .eq('id', sendRecord.id);
      }

      if (currentStep.ab_test_enabled && !currentStep.ab_winner) {
        await maybeSetAbWinner(currentStep.id);
      }

      const nextStepIndex = stepIndex + 1;
      const nextStep = steps[nextStepIndex];
      if (nextStep) {
        const nextSend = computeNextSendAt(nextStep.delay_days, seq.send_hour);
        await supabaseAdmin.from('sequence_enrollments').update({
          current_step: nextStepIndex,
          next_send_at: nextSend.toISOString(),
        }).eq('id', enrollment.id);
      } else {
        await supabaseAdmin.from('sequence_enrollments').update({
          status: 'completed',
          completed_at: now,
          next_send_at: null,
        }).eq('id', enrollment.id);
      }

      processed++;
    } catch (err) {
      console.error(`[sequences] Error processing enrollment ${enrollment.id}:`, err);
      failed++;
    }
  }

  return apiSuccess({ processed, failed, total: due.length });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function personalizeEmail(template: string, lead: LeadData): string {
  return template
    .replace(/\{\{first_name\}\}/g, lead.first_name ?? 'vous')
    .replace(/\{\{last_name\}\}/g, lead.last_name ?? '')
    .replace(/\{\{full_name\}\}/g, [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'vous')
    .replace(/\{\{company\}\}/g, lead.company ?? 'votre équipe');
}

function computeNextSendAt(delayDays: number, sendHour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + delayDays);
  d.setHours(sendHour, 0, 0, 0);
  return d;
}

async function sendViaEmail({
  grantId, from: _from, to, subject, body
}: {
  grantId: string; from: string; to: string; subject: string; body: string;
}): Promise<string> {
  const nylasKey = process.env.NYLAS_API_KEY;
  if (!nylasKey) throw new Error('NYLAS_API_KEY not set');

  const res = await fetch(`https://api.us.nylas.com/v3/grants/${grantId}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${nylasKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject, body, to: [{ email: to }] }),
  });

  if (!res.ok) throw new Error(`Nylas ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { data?: { id?: string } };
  return data.data?.id ?? 'unknown';
}

async function maybeSetAbWinner(stepId: string) {
  const { data: sends } = await supabaseAdmin
    .from('sequence_sends')
    .select('ab_variant, opened_at')
    .eq('step_id', stepId)
    .not('ab_variant', 'is', null);

  if (!sends) return;

  const aTotal = sends.filter((s: { ab_variant: string | null }) => s.ab_variant === 'a').length;
  const bTotal = sends.filter((s: { ab_variant: string | null }) => s.ab_variant === 'b').length;
  if (aTotal < 50 || bTotal < 50) return;

  const aOpened = sends.filter((s: { ab_variant: string | null; opened_at: string | null }) => s.ab_variant === 'a' && s.opened_at).length;
  const bOpened = sends.filter((s: { ab_variant: string | null; opened_at: string | null }) => s.ab_variant === 'b' && s.opened_at).length;
  const winner = (aOpened / aTotal) >= (bOpened / bTotal) ? 'a' : 'b';
  await supabaseAdmin.from('sequence_steps').update({ ab_winner: winner }).eq('id', stepId);
}
