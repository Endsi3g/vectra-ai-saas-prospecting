import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const provider = searchParams.get('provider') || 'gmail';

  if (!code) {
    return NextResponse.redirect(new URL('/app/settings/mailboxes?error=no_code', request.url));
  }

  const clientId = process.env.NYLAS_CLIENT_ID;
  const clientSecret = process.env.NYLAS_CLIENT_SECRET;
  
  let grantId = `mock-grant-${Math.random().toString(36).substring(7)}`;
  let email = '';

  try {
    // 1. Get the current active user from Supabase to associate the mailbox
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[Nylas Callback] User authentication failed:', userError);
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // Assign a clean mailbox email address based on active user context
    email = provider === 'gmail' 
      ? `${user.email?.split('@')[0]}@gmail.com` 
      : `${user.email?.split('@')[0]}@outlook.com`;

    // 2. Real OAuth exchange if credentials exist
    if (clientId && clientSecret) {
      console.log('[Nylas Callback] Exchanging code for token...');
      const tokenResponse = await fetch('https://api.nylas.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Nylas Callback] Nylas token exchange failure:', errorText);
        return NextResponse.redirect(new URL('/app/settings/mailboxes?error=token_exchange_failed', request.url));
      }

      const tokenData = await tokenResponse.json();
      grantId = tokenData.access_token || tokenData.grant_id; // Nylas v2 vs v3
      email = tokenData.email_address || email;
    } else {
      console.log(`[Nylas Callback] Dev environment: persisting mock mailbox credentials for email: ${email}`);
    }

    // 3. Upsert mailbox entry into Supabase database
    const { error: dbError } = await supabase
      .from('mailboxes')
      .insert({
        user_id: user.id,
        email: email.toLowerCase(),
        provider,
        nylas_grant_id: grantId,
        status: 'connected'
      });

    if (dbError) {
      // Check for duplicate key violation (23505)
      if (dbError.code === '23505') {
        console.warn(`[Nylas Callback] Mailbox ${email} already connected.`);
        return NextResponse.redirect(new URL('/app/settings/mailboxes?error=already_connected', request.url));
      }
      throw dbError;
    }

    return NextResponse.redirect(new URL('/app/settings/mailboxes?success=true', request.url));

  } catch (err) {
    console.error('[Nylas Callback] Unhandled callback error:', err);
    return NextResponse.redirect(new URL('/app/settings/mailboxes?error=server_error', request.url));
  }
}
