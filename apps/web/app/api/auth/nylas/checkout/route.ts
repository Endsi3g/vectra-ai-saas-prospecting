import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'gmail';
  
  const clientId = process.env.NYLAS_CLIENT_ID;
  const redirectUri = process.env.NYLAS_REDIRECT_URI || 'http://localhost:3000/api/auth/nylas/callback';

  // If credentials are not configured, simulate a premium mock OAuth loop for offline developer comfort
  if (!clientId) {
    console.log(`[Nylas Auth] Client ID not found. Simulating mock authentication callback loop for provider: ${provider}`);
    const mockCallbackUrl = new URL(redirectUri);
    mockCallbackUrl.searchParams.set('code', `mock-code-${provider}-${Math.random().toString(36).substring(7)}`);
    mockCallbackUrl.searchParams.set('provider', provider);
    
    return NextResponse.redirect(mockCallbackUrl.toString());
  }

  // Build the authentic Nylas Hosted OAuth Authorize URL for v3
  const nylasAuthUrl = new URL('https://api.us.nylas.com/v3/connect/auth');
  nylasAuthUrl.searchParams.set('client_id', clientId);
  nylasAuthUrl.searchParams.set('redirect_uri', redirectUri);
  nylasAuthUrl.searchParams.set('response_type', 'code');
  nylasAuthUrl.searchParams.set('provider', provider === 'gmail' ? 'google' : 'microsoft');
  
  return NextResponse.redirect(nylasAuthUrl.toString());
}
