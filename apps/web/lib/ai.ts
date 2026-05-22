interface CompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}

interface CompletionResult {
  content: string;
  provider: 'openrouter' | 'openai' | 'mock';
}

// ── Structured mock for dev without API keys ──────────────────────────────────

function getMockCompletion(userPrompt: string, jsonMode: boolean): string {
  if (jsonMode) {
    return JSON.stringify({
      reasoning: 'Profil analysé. Pain point identifié: prospection manuelle chronophage.',
      email_subject: 'Automatiser votre prospection B2B — Vectra',
      email_body: "Bonjour,\n\nJ'ai vu que vous gérez votre prospection manuellement. Vectra peut automatiser 80% de ce travail en moins d'une semaine.\n\nDispo pour 20 min cette semaine ?",
      linkedin_message: 'Bonjour ! Je pense que Vectra pourrait vous faire gagner du temps sur la prospection. Curieux d\'en discuter ?',
      personalization_score: 72,
    });
  }
  const nameMatch = userPrompt.match(/(?:prénom|name|contact)[:\s]+([A-Za-zÀ-ÿ]+)/i);
  const companyMatch = userPrompt.match(/(?:entreprise|company|société)[:\s]+([A-Za-zÀ-ÿ0-9\s]+?)(?:\n|,|\.|$)/i);
  const name = nameMatch?.[1] ?? 'vous';
  const company = companyMatch?.[1]?.trim() ?? 'votre équipe';
  return `Bonjour ${name},\n\nJ'ai analysé le profil de ${company} et je pense que notre approche pourrait vous aider à accélérer votre croissance.\n\nNous aidons des entreprises similaires à optimiser leur prospection et à augmenter leur taux de conversion.\n\nSeriez-vous disponible pour un échange de 15 minutes cette semaine ?\n\nCordialement`;
}

// ── Single provider call ──────────────────────────────────────────────────────

async function callProvider(
  apiKey: string,
  endpoint: string,
  model: string,
  extraHeaders: Record<string, string>,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  temperature: number,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${endpoint} ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── Main export — multi-model with automatic fallback ────────────────────────

export async function getCompletion({
  systemPrompt,
  userPrompt,
  jsonMode = false,
  temperature = 0.7,
}: CompletionOptions): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openaiKey && !openrouterKey) {
    return getMockCompletion(userPrompt, jsonMode);
  }

  // Try OpenRouter first
  if (openrouterKey) {
    try {
      return await callProvider(
        openrouterKey,
        'https://openrouter.ai/api/v1/chat/completions',
        'openrouter/free',
        {
          'HTTP-Referer': 'https://vectra-ai-saas-prospecting.vercel.app',
          'X-Title': 'Vectra OS',
        },
        systemPrompt,
        userPrompt,
        jsonMode,
        temperature,
      );
    } catch (err) {
      console.warn('[ai] OpenRouter failed, falling back to OpenAI:', (err as Error).message);
    }
  }

  // Fallback: OpenAI
  if (openaiKey) {
    try {
      return await callProvider(
        openaiKey,
        'https://api.openai.com/v1/chat/completions',
        'gpt-4o-mini',
        {},
        systemPrompt,
        userPrompt,
        jsonMode,
        temperature,
      );
    } catch (err) {
      console.warn('[ai] OpenAI also failed, using mock:', (err as Error).message);
    }
  }

  // Final fallback: structured mock
  return getMockCompletion(userPrompt, jsonMode);
}

// ── Vision (multimodal) ───────────────────────────────────────────────────────

export async function getCompletionWithVision({
  prompt,
  imageBase64,
  mimeType = 'image/png',
  jsonMode = false,
}: {
  prompt: string;
  imageBase64: string;
  mimeType?: string;
  jsonMode?: boolean;
}): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey && !openrouterKey) {
    return JSON.stringify({ name: 'Jean Dupont', role: 'CEO', company: 'Startup SAS', email: '', linkedin_url: '', phone: '', location: '' });
  }

  const apiKey = openrouterKey ?? openaiKey!;
  const endpoint = openrouterKey
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = openrouterKey ? 'openai/gpt-4o' : 'gpt-4o';

  const body: Record<string, unknown> = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ],
    max_tokens: 500,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(openrouterKey ? { 'HTTP-Referer': 'https://vectra-ai-saas-prospecting.vercel.app', 'X-Title': 'Vectra OS' } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Vision API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── Streaming helper ──────────────────────────────────────────────────────────

export async function* streamCompletion({
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  signal,
}: CompletionOptions & { signal?: AbortSignal }): AsyncGenerator<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey && !openrouterKey) {
    const mock = getMockCompletion(userPrompt, false);
    for (const word of mock.split(' ')) {
      yield word + ' ';
      await new Promise((r) => setTimeout(r, 40));
    }
    return;
  }

  const apiKey = openrouterKey ?? openaiKey!;
  const endpoint = openrouterKey
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = openrouterKey ? 'openrouter/free' : 'gpt-4o-mini';

  const res = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(openrouterKey ? { 'HTTP-Referer': 'https://vectra-ai-saas-prospecting.vercel.app', 'X-Title': 'Vectra OS' } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream API ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;
      try {
        const json = JSON.parse(trimmed.slice(6)) as { choices?: Array<{ delta?: { content?: string } }> };
        const token = json.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // malformed SSE line — ignore
      }
    }
  }
}
