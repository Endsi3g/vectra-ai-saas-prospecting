import { NextRequest, NextResponse } from 'next/server';
import { getCompletion } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json() as { imageBase64?: string };
    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openrouterKey && !openaiKey) {
      // Mock response for dev without API keys
      return NextResponse.json({
        name: 'Jean Dupont',
        role: 'CEO',
        company: 'Startup SAS',
        email: '',
        linkedin_url: '',
        phone: '',
      });
    }

    const endpoint = openrouterKey
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const apiKey = openrouterKey || openaiKey;
    const model = openrouterKey ? 'openai/gpt-4o' : 'gpt-4o';

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(openrouterKey ? { 'HTTP-Referer': 'https://vectra-ai-saas-prospecting.vercel.app', 'X-Title': 'Vectra OS' } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extrais les informations de contact depuis cette capture d'écran LinkedIn. Réponds UNIQUEMENT en JSON avec les clés: name, role, company, email, linkedin_url, phone, location. Si une info est absente, retourne une chaîne vide.`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${imageBase64}` },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `Vision API error: ${err}` }, { status: 500 });
    }

    const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '{}';
    const lead = JSON.parse(content) as Record<string, string>;

    return NextResponse.json(lead);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
