import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Authenticate inviter
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Check inviter's plan (Scale plan required for team members)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, workspace_id')
      .eq('id', userId)
      .single();

    const nylasClientSecret = process.env.NYLAS_CLIENT_SECRET;
    const hasTeamAccess = profile?.plan === 'agency' || profile?.plan === 'scale';

    if (!hasTeamAccess) {
      return NextResponse.json(
        { error: 'L\'invitation de membres nécessite le plan Scale. Mettez à niveau votre abonnement.' },
        { status: 403 }
      );
    }

    // Send invitation via Supabase Auth (triggers built-in invite email)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vectra.ai';
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=invite`,
      data: {
        invited_by: userId,
        workspace_id: profile?.workspace_id,
        role
      }
    });

    if (error) {
      if (error.message?.includes('already been registered')) {
        return NextResponse.json({ error: 'Cet email est déjà inscrit sur Vectra.' }, { status: 409 });
      }
      console.error('[TEAM INVITE ERROR]', error);
      return NextResponse.json({ error: error.message || 'Échec de l\'invitation' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Invitation envoyée à ${email}`,
      user_id: data.user?.id
    });

  } catch (err: any) {
    console.error('[TEAM INVITE ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
