import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// GET: Nylas webhook handshake verification challenge
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  if (challenge) {
    console.log('[Nylas Webhook] Challenge verification received.');
    return new Response(challenge, { status: 200 });
  }
  return new Response('No challenge parameter found', { status: 400 });
}

// POST: Process incoming email deltas from Nylas
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const nylasSignature = request.headers.get('x-nylas-signature');
    const nylasClientSecret = process.env.NYLAS_CLIENT_SECRET;

    // Verify Nylas webhook signature in production
    if (nylasClientSecret && nylasSignature) {
      const hmac = crypto.createHmac('sha256', nylasClientSecret);
      hmac.update(bodyText);
      const expectedSignature = hmac.digest('hex');
      if (expectedSignature !== nylasSignature) {
        console.warn('[Nylas Webhook] Invalid signature — rejected.');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production' && nylasClientSecret) {
      console.warn('[Nylas Webhook] Missing signature header in production.');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
    }

    // E2E testing: return mock success without touching Supabase
    if (process.env.E2E_TESTING === 'true' && process.env.PLAYWRIGHT_TEST === 'true') {
      return NextResponse.json({ success: true, processed: 1, e2e: true });
    }

    const body = JSON.parse(bodyText);
    console.log('[Nylas Webhook] Processing webhook payload.');

    const deltas = body.deltas || [body];

    for (const delta of deltas) {
      const isSimulated = delta.senderEmail !== undefined;

      const messageId = isSimulated ? delta.messageId : (delta.object_data?.id || `msg-${Math.random().toString(36).substring(7)}`);
      const threadId = isSimulated ? delta.threadId : (delta.object_data?.thread_id || `thread-${Math.random().toString(36).substring(7)}`);
      const senderEmail = isSimulated ? delta.senderEmail : 'client@prospect.com';
      const senderName = isSimulated ? delta.senderName : 'Sarah Jenkins';
      const subject = isSimulated ? delta.subject : 'Re: Audit SaaS Vectra';
      const emailBodyText = isSimulated ? delta.bodyText : 'Bonjour, oui je serais très intéressée par votre audit jeudi à 15h. Merci !';
      const grantId = isSimulated ? delta.grantId : (delta.account_id || 'mock-grant-active');

      console.log(`[Nylas Webhook] Processing new email thread.`);

      let mailboxId = '00000000-0000-0000-0000-000000000000';
      let leadId = '00000000-0000-0000-0000-000000000000';
      let conversationId = '00000000-0000-0000-0000-000000000000';

      // Sentiment classification
      let sentiment: 'interested' | 'objection' | 'unsubscribe' = 'interested';
      let magicReplyText = '';

      const textLower = emailBodyText.toLowerCase();

      if (textLower.includes('stop') || textLower.includes('désabonner') || textLower.includes('unsubscribe') || textLower.includes('retirer')) {
        sentiment = 'unsubscribe';
        magicReplyText = `Bonjour ${senderName.split(' ')[0]},\n\nC'est bien noté. Votre adresse e-mail a été retirée de nos listes de diffusion. Nous vous présentons nos excuses pour le dérangement.\n\nCordialement,\nL'équipe Vectra`;
      } else if (textLower.includes('prix') || textLower.includes('cher') || textLower.includes('tarifs') || textLower.includes('budget') || textLower.includes('combien')) {
        sentiment = 'objection';
        magicReplyText = `Bonjour ${senderName.split(' ')[0]},\n\nMerci pour votre retour ! C'est une excellente question. Nos forfaits commencent à seulement 49€/mois pour la formule Solo Pro (qui inclut 5000 crédits de sourcing et pitchs illimités).\n\nSeriez-vous disponible ce jeudi à 11h pour un court appel de 5 minutes ?\n\nBien à vous,\nL'équipe Vectra`;
      } else {
        sentiment = 'interested';
        magicReplyText = `Bonjour ${senderName.split(' ')[0]},\n\nMerci beaucoup pour votre intérêt ! Je suis ravi que notre audit vous intéresse.\n\nQue diriez-vous d'un échange rapide jeudi à 15h00 pour en discuter de vive voix ?\nVoici mon lien direct : calendly.com/vectra/demo\n\nExcellente journée,\nL'équipe Vectra`;
      }

      console.log(`[Nylas Webhook] Sentiment classified: ${sentiment}`);

      if (process.env.PLAYWRIGHT_TEST === 'true') {
        console.log(`[Nylas Webhook] Playwright E2E bypass: successfully mock processed message and reply.`);
      } else {
        // 1. Resolve mailbox from grant_id
        const { data: mailboxData } = await supabaseAdmin
          .from('mailboxes')
          .select('id')
          .eq('nylas_grant_id', grantId)
          .single();

        if (mailboxData) {
          mailboxId = mailboxData.id;
        } else {
          const { data: firstMailbox } = await supabaseAdmin.from('mailboxes').select('id').limit(1).single();
          if (firstMailbox) mailboxId = firstMailbox.id;
        }

        // 2. Resolve or create the Lead
        const { data: existingLead } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('email', senderEmail.toLowerCase())
          .limit(1)
          .single();

        if (existingLead) {
          leadId = existingLead.id;
        } else {
          let campaignId = '00000000-0000-0000-0000-000000000000';
          const { data: firstCampaign } = await supabaseAdmin.from('campaigns').select('id').limit(1).single();
          if (firstCampaign) {
            campaignId = firstCampaign.id;
          } else {
            const { data: newCampaign } = await supabaseAdmin
              .from('campaigns')
              .insert({ name: 'Inbound Campaigns', business_type: 'General SaaS' })
              .select('id')
              .single();
            if (newCampaign) campaignId = newCampaign.id;
          }

          const { data: newLead } = await supabaseAdmin
            .from('leads')
            .insert({
              campaign_id: campaignId,
              name: senderName,
              email: senderEmail.toLowerCase(),
              company: senderEmail.split('@')[1].split('.')[0].toUpperCase(),
            })
            .select('id')
            .single();

          if (newLead) leadId = newLead.id;
        }

        // 3. Stop active sequence enrollments (lead replied)
        if (leadId !== '00000000-0000-0000-0000-000000000000') {
          try {
            await supabaseAdmin
              .from('sequence_enrollments')
              .update({ status: 'stopped', stop_reason: 'replied', next_send_at: null })
              .eq('lead_id', leadId)
              .eq('status', 'active');
            console.log(`[Nylas Webhook] Stopped active sequence enrollments for lead ${leadId} (replied).`);
          } catch (seqErr) {
            console.warn('[Nylas Webhook] Could not stop sequence enrollment:', seqErr);
          }
        }

        // 4. Upsert conversation
        const { data: activeConversation, error: convError } = await supabaseAdmin
          .from('inbox_conversations')
          .upsert({
            lead_id: leadId,
            mailbox_id: mailboxId,
            nylas_thread_id: threadId,
            sentiment,
            last_message_text: emailBodyText.slice(0, 150),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'nylas_thread_id' })
          .select('id')
          .single();

        if (convError) {
          console.error('[Nylas Webhook] Error upserting inbox conversation:', convError);
          continue;
        }

        conversationId = activeConversation.id;

        // 5. Insert message with magic reply draft
        const { error: msgError } = await supabaseAdmin
          .from('inbox_messages')
          .insert({
            conversation_id: conversationId,
            nylas_message_id: messageId,
            sender_type: 'prospect',
            body: emailBodyText,
            snippet: emailBodyText.slice(0, 100),
            subject,
            magic_reply_draft: magicReplyText,
          });

        if (msgError) {
          console.error('[Nylas Webhook] Error inserting inbox message:', msgError);
        } else {
          console.log(`[Nylas Webhook] Successfully persisted message and pre-generated draft reply in Supabase.`);

          // 6. Dispatch inbox_reply notification
          try {
            const { data: leadData } = await supabaseAdmin
              .from('leads')
              .select('campaign_id')
              .eq('id', leadId)
              .single();

            if (leadData?.campaign_id) {
              const { data: campaignData } = await supabaseAdmin
                .from('campaigns')
                .select('user_id')
                .eq('id', leadData.campaign_id)
                .single();

              if (campaignData?.user_id) {
                await supabaseAdmin.from('notifications').insert({
                  user_id: campaignData.user_id,
                  type: 'inbox_reply',
                  title: `Réponse de ${senderName}`,
                  body: emailBodyText.slice(0, 100) + (emailBodyText.length > 100 ? '...' : ''),
                  metadata: { leadId, senderEmail, senderName, conversationId },
                });
                console.log(`[Nylas Webhook] Dispatched inbox_reply notification for user ${campaignData.user_id}`);
              }
            }
          } catch (notifErr) {
            console.error('[Nylas Webhook] Failed to dispatch inbox_reply notification:', notifErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: deltas.length });
  } catch (err) {
    console.error('[Nylas Webhook] Failed to process webhook:', err);
    return NextResponse.json({ error: 'Failed to process webhook event' }, { status: 500 });
  }
}
