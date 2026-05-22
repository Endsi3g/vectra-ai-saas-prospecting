import { NextRequest, NextResponse } from 'next/server';
import type { ExpoNotificationPayload } from '@workspace/core/types';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as ExpoNotificationPayload | ExpoNotificationPayload[];
    const notifications = Array.isArray(payload) ? payload : [payload];

    const filtered = notifications.filter((n) => n.to.startsWith('ExponentPushToken['));

    if (filtered.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const resp = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(filtered),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `Expo push error: ${err}` }, { status: 500 });
    }

    const result = await resp.json();
    return NextResponse.json({ ok: true, sent: filtered.length, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
