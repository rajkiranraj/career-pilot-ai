import { jsonrepair } from "https://esm.sh/jsonrepair@3.4.0";

declare const Deno: any;

export interface NvidiaOptions {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model?: string;
}

/**
 * Call NVIDIA NIM via the OpenAI-compatible chat completions endpoint.
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
    topP = 0.70,
    frequencyPenalty = 0.0,
    presencePenalty = 0.0,
    model = Deno.env.get('NVIDIA_MODEL') || 'google/gemma-3n-e2b-it',
  } = options;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
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

export const generateContent = async (
  prompt: string,
  options: NvidiaOptions = {}
): Promise<string> => generateWithNvidia(prompt, options);

export const generateJson = async (
  prompt: string,
  options: NvidiaOptions = {}
): Promise<any> => {
  const text = await generateWithNvidia(prompt, {
    systemPrompt:
      options.systemPrompt ||
      'You are a strict JSON generator. Return only valid JSON.',
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    topP: options.topP,
    frequencyPenalty: options.frequencyPenalty,
    presencePenalty: options.presencePenalty,
    model: options.model,
  });

  let cleaned = text.trim();
  const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (match) {
    cleaned = match[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const direct = tryParse(cleaned);
  if (direct) return direct;

  const repaired = cleaned
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  const fallback = tryParse(repaired);
  if (fallback) return fallback;

  try {
    const repairedJson = jsonrepair(cleaned);
    const repairedParsed = tryParse(repairedJson);
    if (repairedParsed) return repairedParsed;
  } catch {
    // ignore repair failure
  }

  console.error('Failed to parse NVIDIA JSON:', 'Raw text:', cleaned);
  throw new Error('The AI returned an invalid data format.');
};
