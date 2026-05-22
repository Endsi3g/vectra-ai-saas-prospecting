import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiUnauthorized } from '@/lib/api-response';

export const runtime = 'nodejs';

// GET /api/sequences/[id]/export — CSV export of all sends
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { data: seq } = await supabaseAdmin
    .from('sequences')
    .select('id, name')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (!seq) return apiError('Séquence introuvable.', 404);

  const { data: stepIds } = await supabaseAdmin
    .from('sequence_steps')
    .select('id, position')
    .eq('sequence_id', params.id);

  const ids = (stepIds ?? []).map((s: { id: string }) => s.id);

  const { data: sends } = ids.length
    ? await supabaseAdmin
        .from('sequence_sends')
        .select(`
          id, status, ab_variant, subject_used, sent_at, opened_at, replied_at, bounced_at, step_id,
          leads(first_name, last_name, email, company)
        `)
        .in('step_id', ids)
        .order('sent_at', { ascending: false })
    : { data: [] };

  const stepPositionMap = Object.fromEntries((stepIds ?? []).map((s: { id: string; position: number }) => [s.id, s.position]));

  type Row = {
    step: number; first_name: string; last_name: string; email: string; company: string;
    subject: string; ab_variant: string; status: string; sent_at: string;
    opened_at: string; replied_at: string; bounced_at: string;
  };

  const rows: Row[] = (sends ?? []).map((s: {
    step_id: string; status: string; ab_variant: string | null; subject_used: string;
    sent_at: string | null; opened_at: string | null; replied_at: string | null; bounced_at: string | null;
    leads: { first_name?: unknown; last_name?: unknown; email?: unknown; company?: unknown }[] | null;
  }) => {
    const lead = Array.isArray(s.leads) ? s.leads[0] : s.leads;
    return ({
      step: (stepPositionMap[s.step_id] ?? 0) + 1,
      first_name: String(lead?.first_name ?? ''),
      last_name: String(lead?.last_name ?? ''),
      email: String(lead?.email ?? ''),
      company: String(lead?.company ?? ''),
      subject: s.subject_used,
      ab_variant: s.ab_variant ?? 'a',
      status: s.status,
      sent_at: s.sent_at ?? '',
      opened_at: s.opened_at ?? '',
      replied_at: s.replied_at ?? '',
      bounced_at: s.bounced_at ?? '',
    });
  });

  const headers: (keyof Row)[] = ['step', 'first_name', 'last_name', 'email', 'company', 'subject', 'ab_variant', 'status', 'sent_at', 'opened_at', 'replied_at', 'bounced_at'];
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String(r[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const filename = `sequence-${(seq.name as string).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
