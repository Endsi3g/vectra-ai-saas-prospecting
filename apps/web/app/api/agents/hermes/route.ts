import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Hermes Agent — automated lead sourcing
 * Triggered manually from /app/agents "Lancer un Cycle" or by external cron.
 *
 * POST body: { user_id?, campaign_id? }
 * Returns: { leads_found, leads_saved, credits_deducted }
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

    // Load agent config from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('agent_config, credits_count')
      .eq('id', userId)
      .single();

    const agentConfig = (profile?.agent_config as Record<string, any>) || {};
    const hermesActive = agentConfig.hermes_active !== false;

    if (!hermesActive) {
      return NextResponse.json({ message: 'Hermes agent is disabled.', leads_found: 0 });
    }

    const matchThreshold = Number(agentConfig.match_threshold || 80);
    const maxLeads = Number(agentConfig.max_leads_limit || 10);

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
      return NextResponse.json({ error: 'No active campaign found for Hermes to use.' }, { status: 400 });
    }

    // Load campaign details to build search query
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    // Build natural language query from campaign ICP
    const query = campaign.icp
      ? `${campaign.icp} ${campaign.business_type || ''}`.trim()
      : 'B2B founders and decision makers';

    // Check credits before running
    const currentCredits = profile?.credits_count || 0;
    const estimatedCost = maxLeads * 5;
    if (currentCredits < estimatedCost) {
      return NextResponse.json({
        error: `Insufficient credits. Need ${estimatedCost}, have ${currentCredits}.`,
        credits_available: currentCredits
      }, { status: 402 });
    }

    // Delegate to sourcing agent pipeline
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const sourcingRes = await fetch(`${origin}/api/sourcing/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: maxLeads, campaign_id: campaignId, user_id: userId })
    });

    if (!sourcingRes.ok) {
      return NextResponse.json({ error: 'Hermes sourcing pipeline failed.' }, { status: 500 });
    }

    // Count how many leads were saved (read SSE stream)
    let leadsFound = 0;
    const reader = sourcingRes.body?.getReader();
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
                if (data.type === 'leads' && Array.isArray(data.leads)) {
                  leadsFound += data.leads.length;
                }
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }
    }

    // Deduct credits
    const creditsUsed = leadsFound * 5;
    if (creditsUsed > 0) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits_count: Math.max(0, currentCredits - creditsUsed) })
        .eq('id', userId);
    }

    return NextResponse.json({
      message: `Hermes cycle complete. ${leadsFound} leads found.`,
      leads_found: leadsFound,
      credits_deducted: creditsUsed,
      campaign_id: campaignId,
      query
    });

  } catch (err) {
    console.error('[HERMES AGENT] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
