import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const dbConnected = !!supabaseUrl;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbConnected ? 'configured' : 'not_configured',
        ai: !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) ? 'configured' : 'mock',
        email: !!process.env.RESEND_API_KEY ? 'configured' : 'mock',
        billing: !!process.env.STRIPE_SECRET_KEY ? 'configured' : 'mock',
        search: !!process.env.SERPER_API_KEY ? 'configured' : 'mock',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
