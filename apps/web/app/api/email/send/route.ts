import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody, mailbox_id, lead_id } = body;

    if (!to || !subject || !emailBody || !mailbox_id) {
      return NextResponse.json({ error: 'Champs requis manquants: to, subject, body, mailbox_id' }, { status: 400 });
    }

    // Authenticate user
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Fetch mailbox grant_id from Supabase
    const { data: mailbox, error: mailboxError } = await supabaseAdmin
      .from('mailboxes')
      .select('nylas_grant_id, email, status')
      .eq('id', mailbox_id)
      .eq('user_id', userId)
      .single();

    if (mailboxError || !mailbox) {
      return NextResponse.json({ error: 'Boîte mail introuvable ou non autorisée' }, { status: 404 });
    }

    if (mailbox.status !== 'connected') {
      return NextResponse.json({ error: 'La boîte mail n\'est pas connectée' }, { status: 400 });
    }

    const nylasClientSecret = process.env.NYLAS_CLIENT_SECRET;

    if (!nylasClientSecret) {
      // Mock fallback for development
      console.log(`[NYLAS MOCK] Would send email to ${to} from ${mailbox.email}: ${subject}`);

      // Update message status in DB if lead_id provided
      if (lead_id) {
        await supabaseAdmin
          .from('messages')
          .update({ status: 'sent' })
          .eq('lead_id', lead_id);
      }

      return NextResponse.json({
        success: true,
        mocked: true,
        message: `Email simulé envoyé à ${to}`,
        from: mailbox.email
      });
    }

    // Send via Nylas V3 API
    const nylasRes = await fetch(
      `https://api.us.nylas.com/v3/grants/${mailbox.nylas_grant_id}/messages/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nylasClientSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          to: [{ email: to }],
          body: emailBody,
        }),
      }
    );

    if (!nylasRes.ok) {
      const errData = await nylasRes.json().catch(() => ({}));
      console.error('[NYLAS SEND ERROR]', errData);
      return NextResponse.json(
        { error: 'Échec de l\'envoi via Nylas', details: errData },
        { status: 502 }
      );
    }

    const sentMessage = await nylasRes.json();

    // Update message status in DB if lead_id provided
    if (lead_id) {
      await supabaseAdmin
        .from('messages')
        .update({ status: 'sent' })
        .eq('lead_id', lead_id);
    }

    return NextResponse.json({
      success: true,
      message_id: sentMessage.data?.id,
      from: mailbox.email,
      to
    });

  } catch (err: any) {
    console.error('[EMAIL SEND ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
