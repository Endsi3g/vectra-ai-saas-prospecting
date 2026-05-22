import { NextRequest, NextResponse } from 'next/server';
import { getCompletion } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text?: string };
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const truncated = text.slice(0, 4000);

    const response = await getCompletion({
      systemPrompt: `Tu es un assistant qui extrait des informations de contact depuis un document. Réponds UNIQUEMENT en JSON avec les clés: name (prénom + nom), role (poste), company (entreprise), email, phone, location. Si une information est absente, retourne une chaîne vide.`,
      userPrompt: `Voici le texte extrait d'un document :\n\n${truncated}\n\nExtrait les informations de contact en JSON.`,
      jsonMode: true,
      temperature: 0.1,
    });

    const lead = JSON.parse(response) as Record<string, string>;
    return NextResponse.json(lead);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
