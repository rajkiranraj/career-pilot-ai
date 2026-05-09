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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
      user = { id: 'test-bypass' }
    } else {
      const token = req.headers.get('Authorization')?.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token)
      if (userError || !authUser) {
        throw new Error('Unauthorized')
      }
      user = authUser
    }

    // Get user profile
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
      Generate 10 technical interview questions for a ${industry} professional${skillsText}.
      
      Each question should be multiple choice with 4 options.
      
      Return the response in this JSON format only, no additional text:
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

    const data = await generateJson(prompt)
    
    return new Response(
      JSON.stringify({ questions: data.questions || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
