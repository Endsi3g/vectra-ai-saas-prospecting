import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-response';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ token: string }> };

// GET /api/unsubscribe/[token] — public endpoint, no auth needed
export async function GET(_req: NextRequest, { params }: Ctx) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { token } = await params;

  const { data: tokenRow } = await supabase
    .from('unsubscribe_tokens')
    .select('id, enrollment_id, lead_id, used_at')
    .eq('token', token)
    .single();

  if (!tokenRow) {
    return new Response(unsubscribeHtml('Lien invalide', 'Ce lien de désabonnement est invalide ou a expiré.', false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 400,
    });
  }

  if (tokenRow.used_at) {
    return new Response(unsubscribeHtml('Déjà désabonné', 'Vous êtes déjà désabonné de cette séquence.', true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Mark token used + stop enrollment
  await Promise.all([
    supabase.from('unsubscribe_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenRow.id),
    supabase.from('sequence_enrollments').update({
      status: 'stopped',
      stop_reason: 'unsubscribed',
      next_send_at: null,
    }).eq('id', tokenRow.enrollment_id),
  ]);

  return new Response(unsubscribeHtml('Désabonnement confirmé', 'Vous avez bien été désabonné. Vous ne recevrez plus d\'emails de cette séquence.', true), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function unsubscribeHtml(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Vectra</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #09090b; color: #fafafa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px 48px; max-width: 440px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 600; margin: 0 0 12px; }
    p { color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: #ffffff; color: #000; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
    a:hover { background: #e5e5e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '✗'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
