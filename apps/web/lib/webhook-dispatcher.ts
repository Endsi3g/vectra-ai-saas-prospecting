import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

export type WebhookEvent =
  | 'lead.created' | 'lead.updated' | 'lead.deleted'
  | 'message.generated' | 'message.approved' | 'message.sent'
  | 'sequence.step_sent' | 'sequence.completed' | 'sequence.stopped'
  | 'inbox.reply_received' | 'inbox.sentiment_changed';

export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  // Find active endpoints subscribed to this event
  const { data: endpoints } = await supabaseAdmin
    .from('webhook_endpoints')
    .select('id, url, secret')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [event]);

  if (!endpoints?.length) return;

  const body = JSON.stringify({
    event,
    created_at: new Date().toISOString(),
    data: payload,
  });

  await Promise.allSettled(
    endpoints.map((ep: { id: string; url: string; secret: string }) =>
      deliverWebhook(userId, ep, event, body, payload)
    )
  );
}

async function deliverWebhook(
  userId: string,
  ep: { id: string; url: string; secret: string },
  event: WebhookEvent,
  body: string,
  payload: Record<string, unknown>,
) {
  const sig = crypto.createHmac('sha256', ep.secret).update(body).digest('hex');
  const start = Date.now();
  let statusCode: number | null = null;
  let response: string | null = null;

  try {
    const res = await fetch(ep.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vectra-Signature': `sha256=${sig}`,
        'X-Vectra-Event': event,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    statusCode = res.status;
    response = await res.text().catch(() => '');
  } catch (err) {
    response = (err as Error).message;
  }

  const latency = Date.now() - start;

  await supabaseAdmin.from('webhook_deliveries').insert({
    endpoint_id: ep.id,
    user_id: userId,
    event,
    payload,
    status_code: statusCode,
    response: response?.slice(0, 500),
    delivered_at: statusCode && statusCode < 300 ? new Date().toISOString() : null,
  });

  if (statusCode) {
    console.log(`[webhook] ${event} → ${ep.url} ${statusCode} (${latency}ms)`);
  } else {
    console.warn(`[webhook] ${event} → ${ep.url} failed: ${response}`);
  }
}
