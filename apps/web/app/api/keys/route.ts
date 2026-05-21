import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, last_used_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error fetching keys: ${error.message}`);
    }

    return NextResponse.json({ keys });
  } catch (err: any) {
    console.error('Keys GET error:', err);
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
    const name = body.name || 'Default Key';

    // Generate secure key
    const randomBytes = crypto.randomBytes(24).toString('base64url'); // ~32 chars
    const rawKey = `vt_live_${randomBytes}`;
    
    // Prefix is first 12 chars: 'vt_live_xxxx'
    const keyPrefix = rawKey.substring(0, 12);
    
    // Hash key using sha256
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name
      })
      .select('id, name, key_prefix, created_at')
      .single();

    if (error) {
      throw new Error(`Database error creating key: ${error.message}`);
    }

    // Return the raw key ONE TIME ONLY in this response
    return NextResponse.json({
      ...data,
      key: rawKey
    });
  } catch (err: any) {
    console.error('Keys POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
