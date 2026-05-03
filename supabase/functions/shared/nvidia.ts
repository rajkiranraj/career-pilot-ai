declare const Deno: any;

export interface NvidiaOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Call NVIDIA's hosted Mistral Large via OpenAI-compatible endpoint.
 * API key from NVIDIA_API_KEY env var — never exposed to frontend.
 */
export const generateWithNvidia = async (
  userMessage: string,
  options: NvidiaOptions = {}
): Promise<string> => {
  const apiKey = Deno.env.get('NVIDIA_API_KEY');
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not set');
  }

  const {
    systemPrompt = 'You are a helpful assistant.',
    maxTokens = 1024,
    temperature = 0.15,
  } = options;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemma-3n-e4b-it',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 0.70,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('NVIDIA API Error:', response.status, errorBody);
    throw new Error(`NVIDIA API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text || !text.trim()) {
    throw new Error('NVIDIA API returned an empty response');
  }

  return text.trim();
};
