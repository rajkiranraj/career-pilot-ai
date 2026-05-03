declare const Deno: any;

export const generateContent = async (prompt: string): Promise<string> => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-3-flash-preview';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API Error:', errorBody);
    throw new Error('Failed to generate content from Gemini');
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Clean markdown block if present
  text = text.trim();
  const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (match) {
    text = match[1];
  }

  return text.trim();
};

export const generateJson = async (prompt: string): Promise<any> => {
  const text = await generateContent(prompt);
  try {
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Failed to parse Gemini JSON:', error, 'Raw text:', text);
    throw new Error('The AI returned an invalid data format.');
  }
};
