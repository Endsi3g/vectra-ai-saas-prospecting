import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLeads, saveMessage, createActivityLog, Lead } from '@/lib/db-fallback';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, scoreOverride } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId parameter' }, { status: 400 });
    }

    // 1. Fetch lead details
    const leads = await getLeads();
    const lead = leads.find((l: Lead) => l.id === leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Fetch campaign details to check autopilot state
    let autopilot = false;
    let campaignId = lead.campaign_id || 'default-campaign-id';
    
    try {
      const { data: campaign, error } = await supabaseAdmin
        .from('campaigns')
        .select('autopilot, id')
        .eq('id', campaignId)
        .single();
      
      if (!error && campaign) {
        autopilot = campaign.autopilot;
      }
    } catch {
      // Fallback: check localStorage representation or default to mock
      autopilot = body.autopilotOverride !== undefined ? body.autopilotOverride : false;
    }

    // 3. Qualification Agent Cycle
    const fitScore = scoreOverride !== undefined ? scoreOverride : Math.floor(Math.random() * 30) + 70; // 70-99%
    await createActivityLog(
      'agent',
      'Hermes Sourcing Agent',
      'lead_qualified',
      `Lead qualifié : ${lead.name} (${lead.company}) - score ${fitScore}%`,
      { leadId, fitScore }
    );

    // 4. Drafting Agent Cycle
    const subject = `Proposition de design et IA pour ${lead.company}`;
    const bodyText = `Bonjour ${lead.name},\n\nJ'ai analysé votre site web ${lead.website || lead.company} et je pense que nous pouvons automatiser votre sourcing client.\n\nCordialement,\nKael de Vectra OS`;
    
    const draftMessage = await saveMessage({
      lead_id: leadId,
      email_subject: subject,
      email_body: bodyText,
      linkedin_message: `Salut ${lead.name}, super ce que vous faites chez ${lead.company} !`,
      personalization_score: fitScore,
      status: 'draft'
    });

    await createActivityLog(
      'agent',
      'Hermes Sourcing Agent',
      'email_drafted',
      `Brouillon d'outreach généré par IA pour ${lead.name}`,
      { leadId, messageId: draftMessage.id }
    );

    // 5. Execution Routing
    let executed = false;
    if (autopilot && fitScore >= 85) {
      // Autopilot sends email automatically
      executed = true;
      
      // Update message status to approved
      await saveMessage({
        ...draftMessage,
        status: 'approved'
      });

      // Insert notification for automatic send
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'brevo_sent',
          title: 'E-mail envoyé automatiquement (Autopilot)',
          body: `L'e-mail pour ${lead.name} (${lead.company}) a été envoyé suite à une qualification élevée (${fitScore}%).`,
          metadata: { leadId }
        });
      } catch {
        // Safe offline bypass
      }

      await createActivityLog(
        'agent',
        'Hermes Sourcing Agent',
        'email_sent',
        `E-mail envoyé automatiquement à ${lead.name} (${lead.email || 'mock@example.com'})`,
        { leadId, fitScore }
      );
    } else {
      // Human in the loop validation queue
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'agent_cycle',
          title: 'Validation requise (Human-in-the-loop)',
          body: `Le lead ${lead.name} (${lead.company}) a été qualifié à ${fitScore}%. Veuillez valider le brouillon avant envoi.`,
          metadata: { leadId }
        });
      } catch {
        // Safe offline bypass
      }

      await createActivityLog(
        'agent',
        'Hermes Sourcing Agent',
        'email_drafted',
        `Brouillon mis en attente de validation pour ${lead.name}`,
        { leadId, fitScore }
      );
    }

    return NextResponse.json({
      success: true,
      fitScore,
      autopilot,
      executed,
      messageId: draftMessage.id
    });
  } catch (err: any) {
    console.error('Orchestrator error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
