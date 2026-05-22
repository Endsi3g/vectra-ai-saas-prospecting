import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    let userId: string | null = null;
    let email: string | null = null;

    // A. Check Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        email = user.email || null;
      }
    }

    // B. Check cookies if header is missing
    if (!userId) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore cookie sets in routes
              }
            },
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        email = user.email || null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the user's profile to check stripe_customer_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', userId)
      .single();

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-02-02-preview' as any,
      });

      let customerId = profile?.stripe_customer_id;

      // If they don't have a customer ID yet, create one in Stripe
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: email || undefined,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;

        // Save it to profiles
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }

      // Generate Stripe Customer Portal session
      const returnUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/app/settings`;
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      console.log('[STRIPE PORTAL CREATED] Billing portal session created.');
      return NextResponse.json({ url: session.url });
    } else {
      // Local development or Testing mock redirection fallback
      console.log('[STRIPE PORTAL MOCK] Creating mock portal session.');
      const fallbackUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/app/settings?billing_status=portal_success`;
      return NextResponse.json({ 
        url: fallbackUrl,
        mocked: true
      });
    }
  } catch (error: any) {
    console.error('Stripe billing portal error:', error);
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error);
    } catch (_) {}
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
