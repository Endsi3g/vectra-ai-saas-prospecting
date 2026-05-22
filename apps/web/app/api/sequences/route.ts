import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess, apiUnauthorized, apiBadRequest } from '@/lib/api-response';

export const runtime = 'nodejs';

// GET /api/sequences — list user's sequences (+ built-in templates)
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const templatesOnly = searchParams.get('templates') === 'true';

  let query = supabaseAdmin
    .from('sequences')
    .select(`
      id, name, description, status, send_hour, timezone, is_template, template_slug,
      campaign_id, created_at, updated_at,
      sequence_steps(id, position, delay_days, subject_a, subject_b, ab_test_enabled),
      sequence_enrollments(count)
    `)
    .order('created_at', { ascending: false });

  if (templatesOnly) {
    query = query.eq('is_template', true);
  } else {
    query = query.or(`user_id.eq.${user.id},is_template.eq.true`);
  }

  const { data, error } = await query;
  if (error) return apiError(error.message);

  return apiSuccess(data);
}

// POST /api/sequences — create new sequence
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const body = await req.json();
  const { name, description, campaign_id, send_hour = 9, timezone = 'Europe/Paris', steps = [], from_template_id, from_template_slug } = body;

  if (!name?.trim()) return apiBadRequest('Le nom de la séquence est requis.');

  // Create sequence
  const { data: seq, error: seqErr } = await supabaseAdmin
    .from('sequences')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description ?? null,
      campaign_id: campaign_id ?? null,
      send_hour,
      timezone,
      status: body.status ?? 'draft',
    })
    .select()
    .single();

  if (seqErr) return apiError(seqErr.message);

  // If cloning a template, copy its steps
  let stepsToInsert: Array<Record<string, unknown>> = steps;
  if (from_template_id && steps.length === 0) {
    const { data: templateSteps } = await supabaseAdmin
      .from('sequence_steps')
      .select('position, delay_days, subject_a, subject_b, body, ab_test_enabled')
      .eq('sequence_id', from_template_id)
      .order('position');
    stepsToInsert = templateSteps ?? [];
  } else if (from_template_slug && steps.length === 0) {
    const { data: tpl } = await supabaseAdmin
      .from('sequences')
      .select('id')
      .eq('template_slug', from_template_slug)
      .eq('is_template', true)
      .single();
    if (tpl) {
      const { data: templateSteps } = await supabaseAdmin
        .from('sequence_steps')
        .select('position, delay_days, subject_a, subject_b, body, ab_test_enabled')
        .eq('sequence_id', tpl.id)
        .order('position');
      stepsToInsert = templateSteps ?? [];
    }
  }

  if (stepsToInsert.length > 0) {
    await supabaseAdmin.from('sequence_steps').insert(
      stepsToInsert.map((s) => ({
        sequence_id: seq.id,
        position: s.position,
        delay_days: s.delay_days ?? 3,
        subject_a: s.subject_a ?? '',
        subject_b: s.subject_b ?? null,
        body: s.body ?? '',
        ab_test_enabled: s.ab_test_enabled ?? false,
      }))
    );
  }

  const { data: full } = await supabaseAdmin
    .from('sequences')
    .select('*, sequence_steps(*)')
    .eq('id', seq.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}
