import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  // Testing bypass only active in local E2E mode — never in production
  const isE2eTesting = process.env.NODE_ENV === 'development' && process.env.E2E_TESTING === 'true';
  const isTestingBypass = isE2eTesting && (
    req.headers.get('x-test-bypass') === 'true' ||
    req.headers.get('Cookie')?.includes('sb-mock-session=true') ||
    process.env.PLAYWRIGHT_TEST === 'true'
  );
  if (isTestingBypass) {
    return { id: 'mock-user-id', email: 'kael@example.com' };
  }

  // 1. Check Authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (token.startsWith('vt_live_')) {
      // API Key Authentication
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('user_id')
        .eq('key_hash', hash)
        .single();
      
      if (data && !error) {
        // Try to update last_used_at timestamp in background asynchronously
        supabaseAdmin
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('key_hash', hash)
          .then();

        // Fetch matching profile/email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('id', data.user_id)
          .single();
          
        return { id: data.user_id, email: profile?.email || '' };
      }
    } else {
      // Supabase JWT Session Token Authentication
      try {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          return { id: user.id, email: user.email };
        }
      } catch (err) {
        console.warn('JWT Verification error in getAuthenticatedUser:', err);
      }
    }
  }

  // 2. Fallback to parsing cookies in request headers for browser context (createServerClient / supabase)
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (user) {
      return { id: user.id, email: user.email };
    }
  } catch (err) {
    console.warn('Cookie session retrieval error in getAuthenticatedUser:', err);
  }

  return null;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data || null;
}
