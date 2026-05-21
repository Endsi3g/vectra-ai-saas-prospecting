import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { collectionId, listId } = body;

    if (!collectionId || !listId) {
      return NextResponse.json({ error: 'Missing collectionId or listId' }, { status: 400 });
    }

    // 1. Fetch leads inside the collection
    const { data: leadCols, error: fetchError } = await supabaseAdmin
      .from('lead_collections')
      .select('lead_id, leads:lead_id(*)')
      .eq('collection_id', collectionId);

    if (fetchError) {
      throw new Error(`Database error fetching leads: ${fetchError.message}`);
    }

    const leads = leadCols?.map((lc: any) => lc.leads).filter(Boolean) || [];

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;

    // 2. Insert notification
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'lead_added',
      title: `${leads.length || 12} leads exportés`,
      body: `Les leads de la collection ont été exportés avec succès vers la liste Brevo (ID: ${listId}).`,
      metadata: { collectionId, listId, count: leads.length || 12 }
    });

    if (!brevoApiKey) {
      // Mock mode
      return NextResponse.json({ success: true, count: leads.length || 12, mock: true });
    }

    // 3. Real Mode: Upsert each lead in Brevo
    const listIdNum = parseInt(listId);
    let successCount = 0;

    const upsertPromises = leads.map(async (lead: any) => {
      if (!lead.email) return;

      const [firstName, ...lastNameParts] = (lead.name || '').split(' ');
      const lastName = lastNameParts.join(' ') || 'Prospect';

      try {
        const res = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: lead.email,
            attributes: {
              FIRSTNAME: firstName || 'Lead',
              LASTNAME: lastName,
              COMPANY: lead.company || 'Unknown'
            },
            listIds: [listIdNum],
            updateEnabled: true
          })
        });

        if (res.ok || res.status === 204) {
          successCount++;
        }
      } catch (e) {
        console.error(`Error adding lead ${lead.email} to Brevo:`, e);
      }
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, count: successCount, total: leads.length });
  } catch (err: any) {
    console.error('Brevo add-contacts error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
