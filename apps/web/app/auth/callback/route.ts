import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            },
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Check if user has completed onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tour_completed')
            .eq('id', user.id)
            .single();

          const destination = profile?.tour_completed ? '/app' : '/onboarding';
          return NextResponse.redirect(`${origin}${destination}`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }

  // Fallback: redirect to sign-in with error param
  return NextResponse.redirect(`${origin}/auth/sign-in?error=callback_failed`);
}
