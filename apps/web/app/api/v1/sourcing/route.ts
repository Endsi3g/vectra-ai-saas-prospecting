import { NextRequest, NextResponse } from 'next/server';
import { authenticateV1, writeRequired } from '@/lib/api-v1-auth';
import { getCompletion } from '@/lib/ai';

export const runtime = 'nodejs';

/**
 * POST /api/v1/sourcing
 * Trigger an AI sourcing run and return structured lead candidates.
 *
 * Body: { query: string, campaign_id?: string, limit?: number }
 * Returns: { candidates: Lead[], sandbox?: boolean }
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateV1(req);
  if ('error' in auth) return auth.error;
  const { ctx } = auth;
  const writeErr = writeRequired(ctx);
  if (writeErr) return writeErr;

  const body = await req.json();
  const { query, limit = 10 } = body as { query: string; campaign_id?: string; limit?: number };

  if (!query?.trim()) return NextResponse.json({ error: 'query is required' }, { status: 422 });
  if (limit > 50) return NextResponse.json({ error: 'limit max is 50' }, { status: 422 });

  if (ctx.isSandbox) {
    return NextResponse.json({
      candidates: MOCK_CANDIDATES.slice(0, limit),
      query,
      sandbox: true,
    });
  }

  const systemPrompt = `Tu es Hermes, un agent IA expert en prospection B2B.
Tu génères des profils de leads qualifiés basés sur les critères fournis.
Réponds UNIQUEMENT en JSON valide.`;

  const userPrompt = `Génère ${limit} profils de leads B2B pour la requête suivante: "${query}"

Réponds avec un JSON exactement de cette forme:
{
  "candidates": [
    {
      "first_name": "...",
      "last_name": "...",
      "email": "prenom.nom@entreprise.com",
      "company": "...",
      "title": "...",
      "linkedin_url": "https://linkedin.com/in/...",
      "score": 0-100,
      "reason": "Raison courte pourquoi ce lead est pertinent"
    }
  ]
}`;

  let candidates: unknown[] = [];
  try {
    const raw = await getCompletion({ systemPrompt, userPrompt, jsonMode: true, temperature: 0.6 });
    const parsed = JSON.parse(raw) as { candidates?: unknown[] };
    candidates = (parsed.candidates ?? []).slice(0, limit);
  } catch {
    candidates = MOCK_CANDIDATES.slice(0, limit);
  }

  return NextResponse.json({ candidates, query, count: candidates.length });
}

const MOCK_CANDIDATES = [
  { first_name: 'Alice', last_name: 'Martin', email: 'alice@startup.io', company: 'Startup SAS', title: 'CEO', linkedin_url: 'https://linkedin.com/in/alice-martin', score: 92, reason: 'Décideur direct, SaaS en croissance' },
  { first_name: 'Bob', last_name: 'Dupont', email: 'bob@scale.co', company: 'Scale Corp', title: 'VP Sales', linkedin_url: 'https://linkedin.com/in/bob-dupont', score: 85, reason: 'Responsable du budget outreach' },
  { first_name: 'Claire', last_name: 'Bernard', email: 'claire@agency.fr', company: 'Agency Pro', title: 'Head of Growth', linkedin_url: 'https://linkedin.com/in/claire-bernard', score: 78, reason: 'Cherche des outils de prospection' },
];
