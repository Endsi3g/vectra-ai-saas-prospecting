import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail, sendJ1NurtureEmail, sendJ3NurtureEmail, sendJ7NurtureEmail } from '@/lib/email';

async function processNurtureEmails(req: Request) {
  // Check authorization
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const results: { email: string; type: string }[] = [];

  try {
    // 1. Send Welcome Email (J0) - Immediately upon finding profile with welcome_email_sent = false
    const { data: j0Profiles, error: j0Error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name')
      .eq('welcome_email_sent', false)
      .limit(10);

    if (j0Error) throw j0Error;

    for (const profile of (j0Profiles || [])) {
      if (profile.email) {
        const name = profile.first_name || profile.email.split('@')[0];
        try {
          await sendWelcomeEmail(profile.email, name);
          await supabaseAdmin
            .from('profiles')
            .update({ welcome_email_sent: true })
            .eq('id', profile.id);
          results.push({ email: profile.email, type: 'J0' });
        } catch (emailErr) {
          console.error(`Error sending Welcome email to ${profile.email}:`, emailErr);
        }
      }
    }

    const now = new Date();

    // 2. Send J1 Email - At least 1 day after created_at
    const j1Threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: j1Profiles, error: j1Error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name')
      .eq('welcome_email_sent', true)
      .eq('j1_email_sent', false)
      .lte('created_at', j1Threshold)
      .limit(10);

    if (j1Error) throw j1Error;

    for (const profile of (j1Profiles || [])) {
      if (profile.email) {
        const name = profile.first_name || profile.email.split('@')[0];
        try {
          await sendJ1NurtureEmail(profile.email, name);
          await supabaseAdmin
            .from('profiles')
            .update({ j1_email_sent: true })
            .eq('id', profile.id);
          results.push({ email: profile.email, type: 'J1' });
        } catch (emailErr) {
          console.error(`Error sending J1 email to ${profile.email}:`, emailErr);
        }
      }
    }

    // 3. Send J3 Email - At least 3 days after created_at
    const j3Threshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: j3Profiles, error: j3Error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name')
      .eq('j1_email_sent', true)
      .eq('j3_email_sent', false)
      .lte('created_at', j3Threshold)
      .limit(10);

    if (j3Error) throw j3Error;

    for (const profile of (j3Profiles || [])) {
      if (profile.email) {
        const name = profile.first_name || profile.email.split('@')[0];
        try {
          await sendJ3NurtureEmail(profile.email, name);
          await supabaseAdmin
            .from('profiles')
            .update({ j3_email_sent: true })
            .eq('id', profile.id);
          results.push({ email: profile.email, type: 'J3' });
        } catch (emailErr) {
          console.error(`Error sending J3 email to ${profile.email}:`, emailErr);
        }
      }
    }

    // 4. Send J7 Email - At least 7 days after created_at
    const j7Threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: j7Profiles, error: j7Error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name')
      .eq('j3_email_sent', true)
      .eq('j7_email_sent', false)
      .lte('created_at', j7Threshold)
      .limit(10);

    if (j7Error) throw j7Error;

    for (const profile of (j7Profiles || [])) {
      if (profile.email) {
        const name = profile.first_name || profile.email.split('@')[0];
        try {
          await sendJ7NurtureEmail(profile.email, name);
          await supabaseAdmin
            .from('profiles')
            .update({ j7_email_sent: true })
            .eq('id', profile.id);
          results.push({ email: profile.email, type: 'J7' });
        } catch (emailErr) {
          console.error(`Error sending J7 email to ${profile.email}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, processedCount: results.length, processed: results });
  } catch (err: any) {
    console.error('[CRON NURTURE ROUTE ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur interne' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return processNurtureEmails(req);
}

export async function POST(req: Request) {
  return processNurtureEmails(req);
}
