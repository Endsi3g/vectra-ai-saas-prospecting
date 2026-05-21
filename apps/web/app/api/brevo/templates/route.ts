import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';

const mockTemplates = [
  { id: 1, name: 'SaaS Pitch Template', subject: 'Optimisez vos cycles de vente B2B', htmlContent: '<p>Bonjour {{contact.FIRSTNAME}},</p><p>J\'ai remarqué que votre entreprise se développe...</p>' },
  { id: 2, name: 'Follow-up Email', subject: 'Question rapide sur votre prospection', htmlContent: '<p>Bonjour {{contact.FIRSTNAME}},</p><p>Je me permets de vous relancer concernant...</p>' },
  { id: 3, name: 'Product Demo Invite', subject: 'Invitation exclusive à essayer Vectra OS v2', htmlContent: '<p>Bonjour {{contact.FIRSTNAME}},</p><p>Nous venons de lancer notre nouvelle version...</p>' }
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
      return NextResponse.json({ connected: false, templates: mockTemplates });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/templates?isActive=true', {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

    const data = await response.json();
    const templates = data.templates || [];

    const formattedTemplates = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      htmlContent: t.htmlContent || ''
    }));

    return NextResponse.json({ connected: true, templates: formattedTemplates });
  } catch (err: any) {
    console.error('Brevo templates GET error:', err);
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
    const { name, subject, htmlContent } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields: name, subject, htmlContent' }, { status: 400 });
    }

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;
    const senderEmail = profile?.brevo_sender_email || 'noreply@vectra.ai';
    const senderName = profile?.brevo_sender_name || 'Vectra OS';

    if (!brevoApiKey) {
      // Mock mode success
      const newMockTemplate = {
        id: mockTemplates.length + 1,
        name,
        subject,
        htmlContent
      };
      return NextResponse.json({ success: true, template: newMockTemplate, mock: true });
    }

    // Real mode
    const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: 'Marketing',
        sender: { name: senderName, email: senderEmail },
        name,
        htmlContent,
        subject,
        isActive: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, templateId: result.id });
  } catch (err: any) {
    console.error('Brevo templates POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
