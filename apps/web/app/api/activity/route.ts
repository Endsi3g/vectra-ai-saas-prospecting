import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getActivityLogs, createActivityLog } from '@/lib/db-fallback';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await getActivityLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error('Activity logs GET error:', err);
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
    const { actor_type, actor_name, activity_type, description, metadata } = body;

    if (!actor_type || !actor_name || !activity_type || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await createActivityLog(actor_type, actor_name, activity_type, description, metadata);
    return NextResponse.json({ log });
  } catch (err: any) {
    console.error('Activity logs POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
