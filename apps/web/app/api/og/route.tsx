import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'Vectra — Prospection IA automatisée';
  const sub = searchParams.get('sub') ?? 'Sourcing. Outreach. Training.';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          padding: '60px 72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>V</div>
          </div>
          <span style={{ color: '#ffffff', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
            VECTRA
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 52,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            marginBottom: 16,
            maxWidth: 820,
          }}
        >
          {title}
        </div>

        {/* Sub */}
        <div style={{ color: '#71717a', fontSize: 24, fontWeight: 400 }}>{sub}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
