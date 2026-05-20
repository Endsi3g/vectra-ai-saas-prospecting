'use client'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function initPostHog() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (typeof window !== 'undefined') {
    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: true
      });
    } else {
      console.log('[POSTHOG MOCK] Analytics mock initialized (no NEXT_PUBLIC_POSTHOG_KEY found)');
    }
  }
}

export function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}

export function captureAnalyticsEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(eventName, properties);
    } else {
      console.log(`[POSTHOG EVENT MOCK] ${eventName}`, properties);
    }
  }
}
