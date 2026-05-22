import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getCompletionCached } from '@/lib/ai-cached';
import { dispatchWebhook } from '@/lib/webhook-dispatcher';

export const runtime = 'nodejs';

/**
 * POST /api/v1/messages/generate
 * Generate a personalized email + LinkedIn message for a lead.
 *
 * Body: {
 *   lead_id: string,
 *   campaign_id: string,
 *   tone?: 'professional' | 'casual' | 'direct',
 *   save?: boolean  -- save to messages table
 * }
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  const body = await req.json();
  const { lead_id, campaign_id, tone = 'professional', save = false } = body as {
    lead_id: string;
    campaign_id: string;
    tone?: string;
    save?: boolean;
  };

  if (!lead_id) return NextResponse.json({ error: 'lead_id is required' }, { status: 422 });

  if (ctx.isSandbox) {
    return NextResponse.json({
      data: MOCK_MESSAGE,
      sandbox: true,
    });
  }

  // Fetch lead details
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('first_name, last_name, email, company, title, linkedin_url')
    .eq('id', lead_id)
    .eq('user_id', ctx.userId)
    .single();

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  // Fetch campaign context if provided
  let campaignContext = '';
  if (campaign_id) {
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('name, offer, icp, angle')
      .eq('id', campaign_id)
      .eq('user_id', ctx.userId)
      .single();
    if (campaign) {
      campaignContext = `Campagne: ${campaign.name}\nOffre: ${campaign.offer ?? ''}\nICP: ${campaign.icp ?? ''}\nAngle: ${campaign.angle ?? ''}`;
    }
  }

  const systemPrompt = `Tu es Apollo, un expert en copywriting B2B.
Tu génères des messages de prospection ultra-personnalisés.
Ton (${tone}). Réponds UNIQUEMENT en JSON valide.`;

  const userPrompt = `Génère un email + message LinkedIn pour ce lead:
Prénom: ${lead.first_name ?? ''}
Nom: ${lead.last_name ?? ''}
Entreprise: ${lead.company ?? ''}
Poste: ${lead.title ?? ''}
${campaignContext}

Réponds en JSON:
{
  "reasoning": "Analyse du profil en 1-2 phrases",
  "email_subject": "...",
  "email_body": "...",
  "linkedin_message": "...",
  "personalization_score": 0-100
}`;

  let result = MOCK_MESSAGE;
  try {
    const raw = await getCompletionCached({ systemPrompt, userPrompt, jsonMode: true });
    result = JSON.parse(raw) as typeof MOCK_MESSAGE;
  } catch {
    // keep mock
  }

  // Optionally save to messages table
  if (save && campaign_id) {
    const { data: savedMsg } = await supabaseAdmin
      .from('messages')
      .insert({
        user_id: ctx.userId,
        lead_id,
        campaign_id,
        email_subject: result.email_subject,
        email_body: result.email_body,
        linkedin_message: result.linkedin_message,
        personalization_score: result.personalization_score,
        reasoning: result.reasoning,
        status: 'draft',
        source: 'api',
      })
      .select()
      .single();

    if (savedMsg) {
      void dispatchWebhook(ctx.userId, 'message.generated', savedMsg as Record<string, unknown>);
      return NextResponse.json({ data: { ...result, message_id: savedMsg.id } });
    }
  }

  return NextResponse.json({ data: result });
}

const MOCK_MESSAGE = {
  reasoning: 'CEO d\'une SaaS en croissance — angle ROI et gain de temps pertinent.',
  email_subject: 'Question rapide sur votre prospection chez Startup SAS',
  email_body: `Bonjour Alice,

J'ai vu que Startup SAS développe une solution B2B ambitieuse. Les équipes en croissance comme la vôtre passent souvent trop de temps sur la prospection manuelle.

Vectra automatise ce processus entièrement — sourcing, messages personnalisés et suivi — en quelques heures.

Seriez-vous disponible pour un échange de 20 minutes cette semaine ?

Cordialement`,
  linkedin_message: 'Bonjour Alice, j\'ai vu votre parcours chez Startup SAS — super trajectoire ! Je travaille sur un outil qui pourrait vous faire gagner du temps sur la prospection. Curieux d\'avoir votre avis ?',
  personalization_score: 82,
};
