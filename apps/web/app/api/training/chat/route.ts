import { NextResponse } from 'next/server';
import { getCompletion } from '@/lib/ai';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { checkRateLimitLLM } from '@/lib/rate-limit';

const PERSONA_PROMPTS: Record<string, string> = {
  ceo_busy: `Tu incarnes Marc, PDG d'une PME de 50 salariés. Tu es extrêmement occupé, souvent en réunion, et tu n'as pas de temps à perdre avec les vendeurs. Tu veux des preuves concrètes de ROI immédiat. Si l'interlocuteur est vague ou peu convaincant, tu raccroches rapidement. Tu poses des questions directes : combien ça coûte, combien ça rapporte, et combien de temps ça prend.`,
  cto_skeptic: `Tu incarnes David, CTO d'une scale-up tech. Tu es très sceptique vis-à-vis des nouvelles solutions SaaS. Tes préoccupations principales sont la sécurité des données, la complexité d'intégration et la fiabilité. Tu demandes des détails techniques précis et tu challengies toutes les affirmations commerciales.`,
  hr_budget: `Tu incarnes Sophie, DRH d'une entreprise de taille moyenne. Tu es intéressée par les solutions innovantes mais tu es contrainte par un budget serré et des processus d'approbation complexes. Tu veux voir un ROI clair et une justification business solide avant tout engagement financier.`,
};

const DIFFICULTY_MODIFIERS: Record<string, string> = {
  easy: `Sois relativement accueillant et ouvert. Pose quelques questions mais ne sois pas trop difficile.`,
  medium: `Sois réaliste et pose des objections pertinentes. Laisse l'interlocuteur progresser s'il argumente bien.`,
  hard: `Sois très résistant et sceptique. Multiplie les objections. Ne cède qu'avec des arguments très convaincants et des preuves solides.`,
};

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Enforce LLM Rate Limits: 10 requests per minute per user
    const limitResult = await checkRateLimitLLM(user.id);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: 10 requests per minute.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limitResult.limit.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': limitResult.reset.toString(),
          }
        }
      );
    }


    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }

    const { persona, difficulty, messages } = await req.json();

    if (!persona || !difficulty || !messages) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const personaPrompt = PERSONA_PROMPTS[persona];
    const difficultyMod = DIFFICULTY_MODIFIERS[difficulty];

    if (!personaPrompt) {
      return NextResponse.json({ error: 'Persona inconnu' }, { status: 400 });
    }

    const conversationHistory = messages
      .map((m: { sender: string; text: string }) =>
        `${m.sender === 'user' ? 'Vendeur' : 'Prospect'}: ${m.text}`
      )
      .join('\n');

    const systemPrompt = `${personaPrompt}\n\n${difficultyMod}\n\nRéponds UNIQUEMENT en tant que ce prospect. Sois concis (2-3 phrases maximum). Ne brise jamais le personnage. Réponds en français.`;

    const userPrompt = conversationHistory
      ? `Historique de la conversation :\n${conversationHistory}\n\nRéponds au dernier message du vendeur.`
      : `La conversation commence. Tu décroches le téléphone. Donne ta première réaction.`;

    const reply = await getCompletion({ systemPrompt, userPrompt, temperature: 0.8 });

    const msgCount = messages.filter((m: { sender: string }) => m.sender === 'user').length;
    const shouldEnd = msgCount >= 6;

    return NextResponse.json({ reply, shouldEnd });
  } catch (err: any) {
    console.error('[TRAINING CHAT ERROR]', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
