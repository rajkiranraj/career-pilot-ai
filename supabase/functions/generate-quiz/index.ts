// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateJson } from '../shared/nvidia.ts'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const log = (stage: string, meta?: Record<string, unknown>) => {
    const elapsed = Math.round(performance.now() - startedAt);
    if (meta) {
      console.log(`[generate-quiz][${requestId}] ${stage}`, meta, `+${elapsed}ms`);
    } else {
      console.log(`[generate-quiz][${requestId}] ${stage} +${elapsed}ms`);
    }
  };

  log("request.start", { method: req.method, url: req.url });

  if (req.method === 'OPTIONS') {
    log("cors.preflight");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    log("auth.init");
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const allowBypass =
      Deno.env.get('ALLOW_TEST_BYPASS') === 'true' &&
      req.headers.get('x-test-bypass') === 'true'
    let user: { id: string } | null = null

    if (allowBypass) {
      log("auth.bypass");
      user = { id: 'test-bypass' }
    } else {
      const token = req.headers.get('Authorization')?.replace('Bearer ', '')
      log("auth.start");
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token)
      if (userError || !authUser) {
        log("auth.fail", { error: userError?.message || 'missing user' });
        throw new Error('Unauthorized')
      }
      user = authUser
      log("auth.success", { userId: user.id });
    }

    // Get user profile
    log("profile.fetch");
    let profile: any = null
    if (allowBypass) {
      profile = { industry: 'General Professional', skills: [] }
    } else {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      profile = data
    }

    const industry = profile?.industry || 'General Professional'
    const skills = profile?.skills || []
    const skillsText = skills.length > 0 ? ` with expertise in ${skills.join(', ')}` : ''

    const prompt = `
      Generate exactly 10 technical interview questions for a ${industry} professional${skillsText}.
      
      Each question must be multiple choice with exactly 4 options.
      
      Return ONLY a valid JSON object. No markdown, no conversational text. Use exactly this format:
      {
        "questions": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswer": "string",
            "explanation": "string"
          }
        ]
      }
    `

    log("nvidia.request", { industry, skillsCount: skills.length });
    const data = await generateJson(prompt, {
      systemPrompt: "You are a strict JSON generator. Return only valid JSON without any markdown tags.",
      maxTokens: 2048,
      temperature: 0.1,
    })
    log("nvidia.response", { hasQuestions: !!data?.questions });

    if (!data || !data.questions || !Array.isArray(data.questions)) {
      throw new Error("AI returned invalid question format");
    }

    return new Response(
      JSON.stringify({ questions: data.questions || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 401 : 400;
    log("error", { message: error.message, stack: error.stack, status });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    )
  }
})
