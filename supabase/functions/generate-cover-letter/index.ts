// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateContent } from '../shared/nvidia.ts'

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

    const { jobDescription, companyName, jobTitle } = await req.json()

    if (!companyName || !jobTitle) {
      throw new Error('companyName and jobTitle are required')
    }

    // Get user profile
    let profile: any = null
    if (allowBypass) {
      profile = { name: 'Test User', industry: 'Software Engineering', bio: '', skills: [] }
    } else {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      profile = data
    }

    const name = profile?.name || 'Professional'
    const industry = profile?.industry || ''
    const bio = profile?.bio || ''
    const skills = profile?.skills || []

    const prompt = `
You are an expert career coach who specializes in writing FAANG-level cover letters optimized for Applicant Tracking Systems (ATS).

TASK: Write a professional cover letter for this position:
Company: ${companyName}
Job Title: ${jobTitle}
Job Description: ${jobDescription || 'Not provided'}

CANDIDATE PROFILE:
Name: ${name}
Industry: ${industry}
Bio: ${bio}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}

STRICT FORMATTING RULES:
1. Output ONLY the cover letter body as plain text (NO markdown, NO bold/italic formatting, NO bullet points, NO headers, NO emojis).
2. ATS systems strip formatting — use only paragraphs and line breaks.
3. Start with "Dear Hiring Manager," (use this exact greeting).
4. Write exactly 3-4 concise paragraphs totaling 250-350 words.
5. Paragraph 1: Strong opening hook. Mention the specific role and company. Express genuine enthusiasm.
6. Paragraph 2: Connect 2-3 specific skills/experiences from the candidate profile to requirements in the job description. Use exact keywords from the job description when possible (this is critical for ATS).
7. Paragraph 3: Quantifiable achievements or impact examples. Use metrics where available (%, $, time saved, users, revenue).
8. Paragraph 4 (optional, keep brief): Closing with a call to action. Reiterate enthusiasm. End with "Sincerely," followed by the candidate's name on the next line.
9. Do NOT include dates, addresses, phone numbers, or email addresses.
10. Do NOT use any markdown syntax like **, *, #, -, etc.
11. Use a professional, confident, but humble tone — typical of top-tier tech company applicants.
12. Mirror language from the job description naturally to maximize ATS keyword matching.
`

    const content = await generateContent(prompt)

    // Try to save to DB, but don't fail if the table doesn't exist
    let coverLetter: any = null
    let dbSaveFailed = false
    if (!allowBypass) {
      try {
        const { data: inserted, error: dbError } = await supabaseClient
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

        if (dbError) {
          console.error('DB insert warning (non-critical):', dbError.message)
          dbSaveFailed = true
        } else {
          coverLetter = inserted
        }
      } catch (dbErr: any) {
        console.error('DB insert warning (non-critical):', dbErr.message)
        dbSaveFailed = true
      }
    }

    // If DB save failed or bypassing, return the content directly so the user still gets their letter
    if (!coverLetter) {
      coverLetter = {
        id: `temp-${Date.now()}`,
        content,
        company_name: companyName,
        job_title: jobTitle,
        job_description: jobDescription,
        created_at: new Date().toISOString(),
        status: 'generated',
        _dbSaveFailed: dbSaveFailed || allowBypass,
        _bypass: allowBypass,
      }
    }

    return new Response(
      JSON.stringify({ coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('generate-cover-letter error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate cover letter' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
