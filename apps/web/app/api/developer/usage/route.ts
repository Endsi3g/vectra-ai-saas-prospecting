import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// GET /api/developer/usage — last 30 days of API request counts per day
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req as unknown as Request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await supabaseAdmin
    .from('api_request_logs')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by date
  const countsByDate: Record<string, number> = {};
  (data ?? []).forEach((row: { created_at: string }) => {
    const date = row.created_at.slice(0, 10);
    countsByDate[date] = (countsByDate[date] ?? 0) + 1;
  });

  // Fill gaps — last 30 days
  const stats: Array<{ date: string; requests: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    stats.push({ date, requests: countsByDate[date] ?? 0 });
  }

  return NextResponse.json(stats);
}
