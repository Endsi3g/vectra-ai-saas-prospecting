import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

const mockCampaigns = [
  { id: '1', name: 'SaaS Launch Promotion', status: 'sent', sent: 4500, opens: 1980, clicks: 395, openRate: 44, clickRate: 8.7, date: '2026-05-18' },
  { id: '2', name: 'Product Update Q2', status: 'sent', sent: 5000, opens: 2150, clicks: 430, openRate: 43, clickRate: 8.6, date: '2026-05-10' },
  { id: '3', name: 'Re-engagement Newsletter', status: 'sent', sent: 2950, opens: 1205, clicks: 236, openRate: 40.8, clickRate: 8.0, date: '2026-05-02' }
];

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;

    if (!brevoApiKey) {
      return NextResponse.json({ connected: false, campaigns: mockCampaigns });
    }

    const response = await fetch('https://api.brevo.com/v3/emailCampaigns?limit=50', {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

    const data = await response.json();
    const campaigns = data.campaigns || [];

    const formattedCampaigns = campaigns.map((c: any) => {
      const stats = c.statistics?.globalStats || {};
      const sent = stats.sent || 0;
      const opened = stats.uniqueViews || 0;
      const clicked = stats.clicks || 0;

      return {
        id: c.id.toString(),
        name: c.name,
        status: c.status,
        sent,
        opens: opened,
        clicks: clicked,
        openRate: sent > 0 ? parseFloat(((opened / sent) * 100).toFixed(1)) : 0,
        clickRate: sent > 0 ? parseFloat(((clicked / sent) * 100).toFixed(1)) : 0,
        date: c.createdAt ? c.createdAt.split('T')[0] : ''
      };
    });

    return NextResponse.json({ connected: true, campaigns: formattedCampaigns });
  } catch (err: any) {
    console.error('Brevo campaigns GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, subject, templateId, listId, htmlContent, scheduledAt } = body;

    if (!name || !subject || !listId) {
      return NextResponse.json({ error: 'Missing required fields: name, subject, listId' }, { status: 400 });
    }

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;
    const senderEmail = profile?.brevo_sender_email || 'noreply@vectra.ai';
    const senderName = profile?.brevo_sender_name || 'Vectra OS';

    // 1. Insert DB notification
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'brevo_sent',
      title: `Campagne créée : ${name}`,
      body: `La campagne "${name}" a été planifiée ou envoyée avec succès pour la liste ID ${listId}.`,
      metadata: { campaignName: name, listId }
    });

    if (!brevoApiKey) {
      // Mock mode
      const newMockCampaign = {
        id: (mockCampaigns.length + 1).toString(),
        name,
        status: scheduledAt ? 'queued' : 'sent',
        sent: scheduledAt ? 0 : 150,
        opens: 0,
        clicks: 0,
        openRate: 0,
        clickRate: 0,
        date: new Date().toISOString().split('T')[0]
      };
      return NextResponse.json({ success: true, campaign: newMockCampaign, mock: true });
    }

    // Real mode
    const payload: any = {
      name,
      subject,
      sender: { name: senderName, email: senderEmail },
      recipients: { listIds: [parseInt(listId)] }
    };

    if (templateId) {
      payload.templateId = parseInt(templateId);
    } else if (htmlContent) {
      payload.htmlContent = htmlContent;
    } else {
      payload.htmlContent = `<html><body><h1>${subject}</h1><p>Cette campagne a été envoyée depuis Vectra OS.</p></body></html>`;
    }

    if (scheduledAt) {
      payload.scheduledAt = new Date(scheduledAt).toISOString();
    }

    const response = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, campaignId: result.id });
  } catch (err: any) {
    console.error('Brevo campaign POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
