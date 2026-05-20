import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const bodyText = await req.text();
  const signature = req.headers.get('stripe-signature');
  const isMockWebhook = req.headers.get('x-mock-webhook') === 'true';

  let event: any;

  try {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey && stripeWebhookSecret && signature && !isMockWebhook) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-02-02-preview' as any,
      });
      event = stripe.webhooks.constructEvent(bodyText, signature, stripeWebhookSecret);
    } else {
      // Mock / Dev fallback bypass
      if (process.env.NODE_ENV === 'production' && !isMockWebhook) {
        return NextResponse.json({ error: 'Webhook secret or signature missing in production.' }, { status: 400 });
      }
      // Direct JSON parse for testing
      event = JSON.parse(bodyText);
      console.log('[STRIPE WEBHOOK MOCK] Received simulated webhook event:', event.type);
    }

    const { type, data } = event;
    console.log(`[STRIPE WEBHOOK] Event type: ${type}`);

    if (type === 'checkout.session.completed') {
      const session = data.object;
      const userId = session.metadata?.userId || session.metadata?.user_id;
      const plan = session.metadata?.plan || 'solo';
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;

      if (!userId) {
        console.error('[STRIPE WEBHOOK] No userId found in session metadata.');
        return NextResponse.json({ received: true, error: 'No userId in metadata' });
      }

      // Map credit limits (Agency: 20000, Solo: 5000, Free: 2000)
      const creditsLimit = plan === 'agency' ? 20000 : plan === 'solo' ? 5000 : 2000;

      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          credits_limit: creditsLimit,
          credits_count: creditsLimit // Refill credits on purchase
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('[STRIPE WEBHOOK] Failed to update profile in database:', error);
        throw error;
      }
      console.log(`[STRIPE WEBHOOK] Successfully upgraded user ${userId} to plan ${plan} with limit ${creditsLimit}`);

      // Proactively send a welcome/confirmation email via Resend
      try {
        const { sendWelcomeEmail } = await import('@/lib/email');
        const userEmail = updatedProfile?.[0]?.email || 'user@example.com';
        const userName = updatedProfile?.[0]?.first_name || 'Vectra User';
        await sendWelcomeEmail(userEmail, userName);
      } catch (err) {
        console.warn('[STRIPE WEBHOOK] Failed to send welcome email:', err);
      }
    } 
    
    else if (type === 'customer.subscription.updated') {
      const subscription = data.object;
      const stripeSubscriptionId = subscription.id;
      const stripeCustomerId = subscription.customer as string;
      
      // Parse plan price ID or metadata
      const priceId = subscription.items.data[0]?.price.id;
      let plan = 'solo';
      if (priceId === process.env.STRIPE_PRICE_AGENCY || subscription.metadata?.plan === 'agency') {
        plan = 'agency';
      }

      const creditsLimit = plan === 'agency' ? 20000 : plan === 'solo' ? 5000 : 2000;

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan,
          credits_limit: creditsLimit,
          stripe_customer_id: stripeCustomerId
        })
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) {
        console.error('[STRIPE WEBHOOK] Failed to update subscription:', error);
        throw error;
      }
      console.log(`[STRIPE WEBHOOK] Successfully updated subscription ${stripeSubscriptionId} to plan ${plan}`);
    } 
    
    else if (type === 'customer.subscription.deleted') {
      const subscription = data.object;
      const stripeSubscriptionId = subscription.id;

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: 'alpha_free',
          stripe_subscription_id: null,
          credits_limit: 2000,
          credits_count: 2000 // Revert and cap credits at free tier
        })
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) {
        console.error('[STRIPE WEBHOOK] Failed to clear deleted subscription:', error);
        throw error;
      }
      console.log(`[STRIPE WEBHOOK] Successfully cancelled/deleted subscription ${stripeSubscriptionId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error);
    } catch (_) {}
    return NextResponse.json({ error: error.message || 'Webhook handler error' }, { status: 400 });
  }
}
