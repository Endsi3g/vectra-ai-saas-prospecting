import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLeadComments, createLeadComment } from '@/lib/db-fallback';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId parameter' }, { status: 400 });
    }

    const comments = await getLeadComments(leadId);
    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error('Comments GET error:', err);
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
    const { leadId, content } = body;

    if (!leadId || !content) {
      return NextResponse.json({ error: 'Missing leadId or content' }, { status: 400 });
    }

    const comment = await createLeadComment(leadId, content);
    return NextResponse.json({ comment });
  } catch (err: any) {
    console.error('Comments POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
