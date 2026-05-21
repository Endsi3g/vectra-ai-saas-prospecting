/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' *.supabase.co *.stripe.com *.posthog.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com js.stripe.com cdn.jsdelivr.net *.posthog.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: *.supabase.co",
              "connect-src 'self' *.supabase.co *.stripe.com *.posthog.com *.sentry.io google.serper.dev api.brevo.com api.nylas.com *.openrouter.ai api.openai.com api.resend.com",
              "frame-src *.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

export default nextConfig
