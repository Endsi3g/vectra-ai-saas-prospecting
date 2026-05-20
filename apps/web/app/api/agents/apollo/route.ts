import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Apollo Agent — automatic message generation for leads without outreach
 * Triggered manually or after Hermes saves new leads.
 *
 * POST body: { user_id?, campaign_id? }
 * Returns: { messages_generated, leads_processed }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let userId = body.user_id as string | undefined;
    let campaignId = body.campaign_id as string | undefined;

    // Resolve user from Authorization header if not in body
    if (!userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load agent config
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('agent_config, credits_count')
      .eq('id', userId)
      .single();

    const agentConfig = (profile?.agent_config as Record<string, any>) || {};
    const apolloActive = agentConfig.apollo_active !== false;

    if (!apolloActive) {
      return NextResponse.json({ message: 'Apollo agent is disabled.', messages_generated: 0 });
    }

    // Resolve campaign
    if (!campaignId) {
      const savedCampaignId = agentConfig.campaign_id as string | undefined;
      if (savedCampaignId) {
        campaignId = savedCampaignId;
      } else {
        const { data: camps } = await supabaseAdmin
          .from('campaigns')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (camps && camps.length > 0 && camps[0]) {
          campaignId = camps[0].id;
        }
      }
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'No active campaign found for Apollo to use.' }, { status: 400 });
    }

    // Find leads in this campaign that have no message yet
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('id, name, company, website, email, notes')
      .eq('campaign_id', campaignId);

    if (!allLeads || allLeads.length === 0) {
      return NextResponse.json({ message: 'No leads found in campaign.', messages_generated: 0 });
    }

    // Find which leads already have messages
    const leadIds = allLeads.map((l: any) => l.id);
    const { data: existingMessages } = await supabaseAdmin
      .from('messages')
      .select('lead_id')
      .in('lead_id', leadIds);

    const leadsWithMessages = new Set((existingMessages || []).map((m: any) => m.lead_id));
    const leadsWithoutMessages = allLeads.filter((l: any) => !leadsWithMessages.has(l.id));

    if (leadsWithoutMessages.length === 0) {
      return NextResponse.json({ message: 'All leads already have messages.', messages_generated: 0 });
    }

    // Check credits
    const currentCredits = profile?.credits_count || 0;
    if (currentCredits < leadsWithoutMessages.length) {
      return NextResponse.json({
        error: `Insufficient credits. Need ${leadsWithoutMessages.length}, have ${currentCredits}.`,
        credits_available: currentCredits
      }, { status: 402 });
    }

    // Call the generate API to create messages for these leads
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const generateRes = await fetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        user_id: userId,
        leads: leadsWithoutMessages
      })
    });

    if (!generateRes.ok) {
      return NextResponse.json({ error: 'Apollo generation pipeline failed.' }, { status: 500 });
    }

    // Consume the SSE stream to count completions
    let messagesGenerated = 0;
    const reader = generateRes.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.type === 'lead_completed') messagesGenerated++;
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: `Apollo cycle complete. ${messagesGenerated} messages generated.`,
      messages_generated: messagesGenerated,
      leads_processed: leadsWithoutMessages.length,
      campaign_id: campaignId
    });

  } catch (err) {
    console.error('[APOLLO AGENT] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
