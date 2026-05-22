import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    // Check E2E testing bypass
    const isE2eTesting = process.env.NODE_ENV === 'development' || process.env.PLAYWRIGHT_TEST === 'true' || process.env.E2E_TESTING === 'true';
    const bypassHeader = req.headers.get('x-test-bypass') === 'true';
    
    // Validate Turnstile if keys are configured and not in bypass mode
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && !isE2eTesting && !bypassHeader) {
      if (!token) {
        return NextResponse.json({ error: 'CAPTCHA de sécurité requis.' }, { status: 400 });
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(token)}`,
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: 'Vérification CAPTCHA échouée. Veuillez réessayer.' }, { status: 400 });
      }
    }

    // Register user via supabaseAdmin
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: email.split('@')[0] },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Fire welcome email asynchronously (no await to prevent delaying user response)
    if (data.user && data.user.email) {
      const name = data.user.user_metadata?.full_name || email.split('@')[0];
      sendWelcomeEmail(data.user.email, name).catch((err) => {
        console.error('[WELCOME EMAIL ERROR]', err);
      });
    }

    return NextResponse.json({ success: true, user: data.user, session: data.session });
  } catch (err: any) {
    console.error('[SIGNUP API ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
