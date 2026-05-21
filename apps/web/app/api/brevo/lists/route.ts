import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';

const mockLists = [
  { id: 1, name: 'Vectra Leads - Tech Companies', totalSubscribers: 1540 },
  { id: 2, name: 'Vectra Leads - SaaS Startups', totalSubscribers: 890 },
  { id: 3, name: 'Newsletter General', totalSubscribers: 3450 }
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
      return NextResponse.json({ connected: false, lists: mockLists });
    }

    const response = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50', {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Brevo API returned status: ${response.status}`);
    }

    const data = await response.json();
    const lists = data.lists || [];

    const formattedLists = lists.map((l: any) => ({
      id: l.id,
      name: l.name,
      totalSubscribers: l.totalSubscribers || 0
    }));

    return NextResponse.json({ connected: true, lists: formattedLists });
  } catch (err: any) {
    console.error('Brevo lists GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
