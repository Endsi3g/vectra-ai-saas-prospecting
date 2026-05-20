import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: 'User ID and Plan are required.' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      // In production, instantiate stripe and create session
      // const stripe = require('stripe')(stripeSecretKey);
      // const session = await stripe.checkout.sessions.create({ ... });
      // return NextResponse.json({ url: session.url });
      
      console.log(`[STRIPE INITIATED] Plan: ${plan} for User: ${userId}`);
      return NextResponse.json({ 
        url: `https://checkout.stripe.com/pay/mock_session?user_id=${userId}&plan=${plan}`,
        mocked: true
      });
    } else {
      // Development mock fallback
      console.log(`[STRIPE MOCK] Creating mock checkout session for user ${userId} and plan ${plan}`);
      const fallbackUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/app?billing_status=success&plan=${plan}`;
      return NextResponse.json({ 
        url: fallbackUrl,
        mocked: true
      });
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    const Sentry = require('@sentry/nextjs');
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
