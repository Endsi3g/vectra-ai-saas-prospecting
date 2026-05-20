export async function getCompletion({
  systemPrompt,
  userPrompt,
  jsonMode = false,
  temperature = 0.7
}: {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openaiApiKey && !openrouterApiKey) {
    throw new Error("No AI API key configured (neither OPENAI_API_KEY nor OPENROUTER_API_KEY).");
  }

  const endpoint = openrouterApiKey 
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const apiKey = openrouterApiKey || openaiApiKey;
  
  // Best free model on OpenRouter: openrouter/free (automatically routes to best available free model)
  // Falling back to gpt-4o-mini if using OpenAI directly.
  const model = openrouterApiKey 
    ? 'openrouter/free' 
    : 'gpt-4o-mini';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (openrouterApiKey) {
    headers['HTTP-Referer'] = 'https://vectra-ai-saas-prospecting.vercel.app';
    headers['X-Title'] = 'Vectra OS';
  }

  const body: any = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API failed with status ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
