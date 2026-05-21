import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { leads, listId } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'Aucun lead fourni' }, { status: 400 });
    }

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;

    if (!brevoApiKey) {
      return NextResponse.json({
        success: true,
        mock: true,
        message: `${leads.length} contacts simulés exportés vers Brevo (mode démo)`,
        imported: leads.length,
      });
    }

    const contacts = leads.map((lead: any) => ({
      email: lead.email,
      attributes: {
        FIRSTNAME: lead.name?.split(' ')[0] || '',
        LASTNAME: lead.name?.split(' ').slice(1).join(' ') || '',
        COMPANY: lead.company || '',
        SMS: lead.phone || '',
      },
      listIds: listId ? [parseInt(listId)] : [],
      updateEnabled: true,
    }));

    const response = await fetch('https://api.brevo.com/v3/contacts/import', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} — ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      imported: leads.length,
      processId: result.processId,
    });
  } catch (err: any) {
    console.error('[BREVO CONTACTS ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
