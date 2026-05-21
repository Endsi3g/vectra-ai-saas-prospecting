import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getProfile } from '@/lib/auth-helper';

const mockSegments = [
  { id: 1, name: 'High Personalization Fit (>80)', count: 240 },
  { id: 2, name: 'Paris Tech Startups', count: 180 },
  { id: 3, name: 'Decision Makers - Engaged', count: 320 }
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
      return NextResponse.json({ connected: false, segments: mockSegments });
    }

    // Brevo segments are technically part of dynamic lists or contacts filter.
    // We can fetch contact lists as a standard representation of segments.
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

    // Filter list names that sound like segments or return all contact lists as segments
    const formattedSegments = lists.map((l: any) => ({
      id: l.id,
      name: l.name,
      count: l.totalSubscribers || 0
    }));

    return NextResponse.json({ connected: true, segments: formattedSegments });
  } catch (err: any) {
    console.error('Brevo segments GET error:', err);
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
    const { name, filterOpts } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const profile = await getProfile(user.id);
    const brevoApiKey = profile?.brevo_api_key;

    if (!brevoApiKey) {
      const newMockSegment = {
        id: mockSegments.length + 1,
        name,
        count: Math.floor(Math.random() * 150) + 10
      };
      return NextResponse.json({ success: true, segment: newMockSegment, mock: true });
    }

    // Creating a dynamic list/segment in Brevo is represented as a contact list.
    // We can create a folder or list to store the segment.
    const response = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Segment: ${name}`,
        folderId: 1 // Default folder
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, segmentId: result.id });
  } catch (err: any) {
    console.error('Brevo segments POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
