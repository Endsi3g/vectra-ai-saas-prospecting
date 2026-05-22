// Prompt caching via Anthropic SDK — reduces costs up to 90% on repeated system prompts.
// Falls back to getCompletion() if the Anthropic key isn't configured.

import { getCompletion } from './ai';

interface CachedCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
  model?: string;
}

export async function getCompletionCached({
  systemPrompt,
  userPrompt,
  jsonMode = false,
  temperature = 0.7,
  model = 'claude-sonnet-4-6',
}: CachedCompletionOptions): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    // Fall back to the multi-model helper (OpenRouter → OpenAI → mock)
    return getCompletion({ systemPrompt, userPrompt, jsonMode, temperature });
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: 2048,
    temperature,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn('[ai-cached] Anthropic failed, falling back:', err);
    return getCompletion({ systemPrompt, userPrompt, jsonMode, temperature });
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
    usage?: { cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  };

  if (data.usage) {
    const cached = data.usage.cache_read_input_tokens ?? 0;
    const created = data.usage.cache_creation_input_tokens ?? 0;
    if (cached > 0 || created > 0) {
      console.log(`[ai-cached] cache_read=${cached} cache_created=${created}`);
    }
  }

  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';

  if (jsonMode) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  }
  return text;
}
