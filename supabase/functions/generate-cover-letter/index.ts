// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateContent } from '../shared/gemini.ts'

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

    const { jobDescription, companyName, jobTitle } = await req.json()

    if (!companyName || !jobTitle) {
      throw new Error('companyName and jobTitle are required')
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const name = profile?.name || 'Professional'
    const industry = profile?.industry || ''
    const bio = profile?.bio || ''
    const skills = profile?.skills || []

    const prompt = `
      Write a professional cover letter for the following position:
      Company: ${companyName}
      Job Title: ${jobTitle}
      Job Description: ${jobDescription || 'Not provided'}
      
      Candidate Information:
      Name: ${name}
      Industry: ${industry}
      Bio: ${bio}
      Skills: ${skills.join(', ')}
      
      Format the output as a professional letter. Do not include any placeholder blocks for addresses, just the main body content starting with "Dear Hiring Manager," (or appropriate greeting) and ending with the candidate's name.
    `

    const content = await generateContent(prompt)
    
    // Save to DB
    const { data: coverLetter, error: dbError } = await supabaseClient
      .from('cover_letters')
      .insert({
        user_id: user.id,
        content: content,
        job_description: jobDescription,
        company_name: companyName,
        job_title: jobTitle,
        status: 'generated'
      })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
