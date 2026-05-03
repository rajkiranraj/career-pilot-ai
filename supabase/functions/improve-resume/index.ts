// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateJson } from '../shared/gemini.ts'

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

    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { resumeContent } = await req.json()

    if (!resumeContent) {
      throw new Error('resumeContent is required')
    }

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('industry, skills')
      .eq('id', user.id)
      .single()

    const industryContext = profile?.industry ? `Target Industry: ${profile.industry}` : ''

    const prompt = `
      Analyze the following resume and provide actionable feedback for improvement.
      ${industryContext}
      
      Resume Content:
      ${resumeContent}
      
      Return the response in this JSON format only:
      {
        "ats_score": number (0-100),
        "feedback": "string (detailed Markdown feedback with sections for Strengths, Weaknesses, and Actionable Improvements)"
      }
    `

    const data = await generateJson(prompt)
    
    // Save to DB
    const { data: resume, error: dbError } = await supabaseClient
      .from('resumes')
      .insert({
        user_id: user.id,
        content: resumeContent,
        ats_score: data.ats_score,
        feedback: data.feedback
      })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ resume }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
