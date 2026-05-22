import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import { apiError, apiSuccess, apiUnauthorized, apiBadRequest } from '@/lib/api-response';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/sequences/[id]/steps — add a single step
export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return apiUnauthorized();

  const { id } = await params;

  const { data: seq } = await supabaseAdmin
    .from('sequences')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (!seq) return apiError('Séquence introuvable.', 404);

  const body = await req.json();
  const { position, delay_days = 3, subject_a = '', subject_b = null, step_body = '', ab_test_enabled = false } = body;
  if (!subject_a) return apiBadRequest('subject_a requis.');

  const { data: step, error } = await supabaseAdmin
    .from('sequence_steps')
    .insert({
      sequence_id: id,
      position: position ?? 0,
      delay_days,
      subject_a,
      subject_b,
      body: step_body,
      ab_test_enabled,
    })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(step, { status: 201 });
}
