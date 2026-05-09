// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateWithNvidia } from '../shared/nvidia.ts'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Prompt map — each key produces a tailored system instruction. */
const SYSTEM_PROMPTS: Record<string, string> = {
  summary:
    `You are a FAANG-level resume coach. Rewrite the provided professional summary to be ATS-optimized and keyword-rich.

STRICT RULES:
- NEVER assume or invent years of experience.
- If the candidate does NOT state years of experience, do NOT include any years of experience.
- If the candidate states years of experience, PRESERVE it EXACTLY.
- Do NOT invent technologies, frameworks, or tools the candidate did not mention.
- Do NOT fabricate companies, roles, or achievements.
- Include 2-3 quantified achievements ONLY if the candidate provided them, otherwise describe impact qualitatively.
- Max 4 sentences.
- Return ONLY the improved text — no labels, no markdown headings, no commentary.`,

  experience:
    `You are a FAANG-level resume coach. Rewrite the provided work responsibilities using the STAR method.

STRICT RULES:
- PRESERVE ALL original numbers, metrics, team sizes, and facts EXACTLY as stated.
- Do NOT inflate numbers. If they say "team of 4", keep "team of 4". If they say "20%", keep "20%".
- Do NOT invent metrics that weren't in the original text.
- Each bullet must start with a strong past-tense action verb (Architected, Reduced, Shipped, Scaled, Led, Owned).
- If the original lacks metrics, improve the language but do NOT fabricate numbers.
- Format as bullet points using the • character, one per line. Max 5 bullets.
- Return ONLY the improved bullets — no intro text, no commentary.`,

  project:
    `You are a FAANG-level resume coach. Rewrite the provided project description to highlight technical depth, scale, and impact.

STRICT RULES:
- PRESERVE ALL original facts, numbers, and technologies exactly.
- Do NOT add technologies or metrics the candidate didn't mention.
- Mention specific technologies FROM the original text.
- 2-4 bullets using the • character.
- Return ONLY the improved bullets — no intro text.`,

  skills:
    `You are a FAANG-level resume coach. Clean up the provided skill list.

STRICT RULES:
- Use exact industry-standard spellings (e.g., PostgreSQL not postgres, Node.js not NodeJS, TypeScript not typescript).
- Return ONLY the skills the candidate listed, with corrected spellings.
- You may add AT MOST 3 closely-related skills that are clearly implied by the listed ones.
- MAXIMUM 12 items total. Do NOT add more.
- Do NOT add entire categories of unrelated skills.
- Return ONLY as comma-separated values — no labels, no categories, no commentary.`,

  achievement:
    `You are a FAANG-level resume coach. Rewrite the provided achievement to be concise and impressive.

STRICT RULES:
- PRESERVE all original facts, rankings, and numbers exactly.
- Do NOT change rankings, percentages, or scores.
- Add context and scale if possible using ONLY information from the original.
- Max 2 sentences. Return ONLY the improved text.`,

  coursework:
    `You are a resume formatting expert. Clean up the provided coursework list.

STRICT RULES:
- Use proper course name formatting (e.g., "Data Structures & Algorithms" not "dsa").
- Return ONLY courses the candidate listed, with clean formatting.
- You may add AT MOST 2 closely related courses.
- Return as comma-separated values — no labels, no commentary.`,

  honors:
    `You are a resume formatting expert. Polish the provided honors/awards text.

STRICT RULES:
- PRESERVE all original facts exactly.
- Improve clarity and formatting only.
- Max 1-2 sentences. Return ONLY the improved text.`,

  ats_fix:
    `You are a FAANG-level resume optimization AI. You will receive a full resume as text along with ATS improvement suggestions. Your job is to improve the resume content to fix the ATS issues.

STRICT RULES:
- PRESERVE the candidate's stated years of experience, company names, job titles, education, and all factual details EXACTLY.
- NEVER assume or invent years of experience if none is stated.
- Do NOT fabricate metrics, technologies, companies, or achievements.
- Do NOT inflate numbers or add false information.
- Improve bullet points by adding strong action verbs where missing.
- If metrics are missing, improve language quality but do NOT invent numbers.
- Keep skills to a reasonable count (max 12 per category).
- Ensure summary is 3-5 sentences if it exists.
- Ensure each job has 3-5 strong bullet points.

Return your response as valid JSON with this exact structure:
{
  "summary": "improved summary text",
  "skills": { "languages": "comma-separated", "frameworks": "comma-separated", "databases": "comma-separated" },
  "experiences": [{ "index": 0, "responsibilities": "improved bullets with • separator" }],
  "projects": [{ "index": 0, "description": "improved description with • separator" }]
}

Only include sections that need improvement. Omit sections that are already good.`,

  general:
    `You are a professional resume writing expert. Improve the following text for a professional resume.

STRICT RULES:
- Keep it concise and impactful.
- Do NOT add false information. Do NOT fabricate metrics.
- PRESERVE all original facts and numbers exactly.
- Return ONLY the improved text — no labels, no markdown, no commentary.`,
}

serve(async (req: Request) => {
  console.log('enhance-text: Received request:', req.method, req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('enhance-text: Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('enhance-text: Initializing Supabase client')
    // ---- Auth ----
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const allowBypass =
      Deno.env.get('ALLOW_TEST_BYPASS') === 'true' &&
      req.headers.get('x-test-bypass') === 'true'
    let user: { id: string } | null = null

    if (allowBypass) {
      console.log('enhance-text: Auth bypass enabled')
      user = { id: 'test-bypass' }
    } else {
      const token = req.headers.get('Authorization')?.replace('Bearer ', '')
      console.log('enhance-text: Authenticating user')
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token)
      if (userError || !authUser) {
        console.error('enhance-text: Authentication failed:', userError?.message)
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      user = authUser
      console.log('enhance-text: User authenticated:', user.id)
    }

    // ---- Input validation ----
    const body = await req.json()
    console.log('enhance-text: Request body parsed')
    const { text, type } = body as { text?: string; type?: string }

    if (!text || typeof text !== 'string' || !text.trim()) {
      console.error('enhance-text: Invalid input - text required')
      return new Response(
        JSON.stringify({ error: 'text is required and must be a non-empty string' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    console.log('enhance-text: Processing type:', type)

    // Resolve system prompt — fall back to `general` for unknown types
    const systemPrompt = SYSTEM_PROMPTS[type || 'general'] || SYSTEM_PROMPTS.general

    console.log('enhance-text: Calling NVIDIA API')
    // ---- Call NVIDIA Gemma 3n ----
    const improved = await generateWithNvidia(text, {
      systemPrompt,
      maxTokens: type === 'ats_fix' ? 2048 : 1024,
      temperature: 0.15,
    })
    console.log('enhance-text: NVIDIA API call successful')

    // For ats_fix, the AI returns JSON — parse and forward it
    if (type === 'ats_fix') {
      let parsed
      try {
        // Robust JSON extraction: find first '{' and last '}'
        const startIdx = improved.indexOf('{')
        const endIdx = improved.lastIndexOf('}')
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          const jsonStr = improved.slice(startIdx, endIdx + 1)
          parsed = JSON.parse(jsonStr)
        } else {
          throw new Error('No JSON object found in response')
        }
      } catch (err) {
        console.error('JSON parse error for ats_fix:', err, 'Raw response:', improved)
        // If JSON parse fails, return as plain improved text
        return new Response(
          JSON.stringify({ improved }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('enhance-text: ATS fix parsed successfully')
      return new Response(
        JSON.stringify({ ats_fix: parsed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('enhance-text: Request completed successfully')
    return new Response(
      JSON.stringify({ improved }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('enhance-text: Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
