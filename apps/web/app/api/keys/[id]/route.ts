import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Database error revoking key: ${error.message}`);
    }

    return NextResponse.json({ revoked: true });
  } catch (err: any) {
    console.error('Keys DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, scope } = body as { name?: string; scope?: string };

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (scope) updates.scope = scope;

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 422 });
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, scope, key_type, is_active, created_at')
      .single();

    if (error) {
      throw new Error(`Database error updating key: ${error.message}`);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Keys PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
