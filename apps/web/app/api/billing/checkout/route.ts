import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedUser } from '@/lib/auth-helper';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;
    const userId = authUser.id;

    if (!plan) {
      return NextResponse.json({ error: 'Plan requis.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      // Production Stripe Checkout session configuration
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-02-02-preview' as any,
      });

      // Price IDs configured in environment variables or default dummy fallback values
      let priceId = plan === 'solo' 
        ? (process.env.STRIPE_PRICE_SOLO || 'price_dummy_solo_monthly')
        : (process.env.STRIPE_PRICE_AGENCY || 'price_dummy_agency_monthly');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/app?billing_status=success&plan=${plan}`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/app/settings`,
        metadata: {
          userId,
          plan,
        },
      });

      console.log('[STRIPE SESSION CREATED] Checkout session created.');
      return NextResponse.json({ url: session.url });
    } else {
      // Local development or Testing mock redirection fallback
      console.log('[STRIPE MOCK] Creating mock checkout session.');
      const successUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/app?billing_status=success&plan=${plan}`;
      return NextResponse.json({ 
        url: successUrl,
        mocked: true
      });
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error);
    } catch (_) {}
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
