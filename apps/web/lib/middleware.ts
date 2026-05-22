import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const isE2eTesting = process.env.NODE_ENV === 'development' || process.env.PLAYWRIGHT_TEST === 'true';
  const hasBypassParam = isE2eTesting && (
    request.nextUrl.searchParams.get('bypass') === 'true' ||
    request.nextUrl.searchParams.get('bypass-auth') === 'true'
  );

  if (hasBypassParam) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('bypass');
    url.searchParams.delete('bypass-auth');
    if (url.pathname === '/' || url.pathname.startsWith('/auth')) {
      url.pathname = '/app';
    }
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set('sb-mock-session', 'true', {
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return redirectResponse;
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  let user = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    try {
      const { data } = await supabase.auth.getClaims();
      user = data?.claims ?? null;
    } catch {
      // Supabase misconfigured — bypass mode handles auth
    }
  }

  const isProtectedPath = request.nextUrl.pathname.startsWith('/app') ||
                          request.nextUrl.pathname.startsWith('/onboarding') ||
                          request.nextUrl.pathname.startsWith('/api/generate');

  // Testing bypass only active in local E2E mode
  const isTestingBypass = isE2eTesting && (
    request.headers.get('x-test-bypass') === 'true' ||
    request.cookies.get('sb-mock-session')?.value === 'true' ||
    process.env.PLAYWRIGHT_TEST === 'true'
  );
  if (!user && isProtectedPath && !isTestingBypass) {
    // no user, respond by redirecting the user to the sign-in page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
