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
        throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`)
      }
      user = authUser
    }

    // Get user profile to determine industry
    let profile: { industry?: string; skills?: string[] } | null = null
    if (allowBypass) {
      profile = { industry: 'software-engineering', skills: [] }
    } else {
      const { data } = await supabaseClient
        .from('profiles')
        .select('industry, skills')
        .eq('id', user.id)
        .maybeSingle()
      profile = data
    }

    if (!profile?.industry && !allowBypass) {
      throw new Error('Please complete onboarding first')
    }

    const industry = profile.industry.replace(/-/g, ' ')
    const skills = profile.skills || []

    const prompt = `
      Generate comprehensive industry insights for the "${industry}" sector.
      ${skills.length > 0 ? `Focus areas include: ${skills.join(', ')}` : ''}
      
      Return the response in this JSON format only, no additional text:
      {
        "salary_ranges": [
          { "role": "Junior", "min": 50000, "max": 80000, "median": 65000 },
          { "role": "Mid-Level", "min": 80000, "max": 120000, "median": 100000 },
          { "role": "Senior", "min": 120000, "max": 180000, "median": 150000 },
          { "role": "Lead/Manager", "min": 150000, "max": 220000, "median": 185000 }
        ],
        "growth_rate": 8.5,
        "demand_level": "High",
        "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "market_outlook": "Positive",
        "key_trends": ["trend1", "trend2", "trend3", "trend4"],
        "recommended_skills": ["opportunity1", "opportunity2", "opportunity3", "opportunity4"]
      }

      Make the data realistic and relevant to the ${industry} industry in 2025.
      salary_ranges should have 4 entries for Junior, Mid-Level, Senior, and Lead/Manager roles.
      growth_rate should be a percentage number (e.g. 8.5).
      demand_level should be one of: "High", "Medium", "Low".
      market_outlook should be one of: "Positive", "Neutral", "Negative".
      top_skills should have 5-8 items.
      key_trends should have 3-5 items.
      recommended_skills should have 3-5 items.
    `

    if (allowBypass) {
      const data = await generateJson(prompt)
      const nextUpdate = new Date()
      nextUpdate.setDate(nextUpdate.getDate() + 7)
      return new Response(
        JSON.stringify({
          insights: {
            industry: profile.industry,
            next_update: nextUpdate.toISOString(),
            ...data,
          },
          bypass: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if we already have fresh insights for this industry
    const { data: existingInsight } = await supabaseClient
      .from('industry_insights')
      .select('*')
      .eq('industry', profile.industry)
      .single()

    const data = await generateJson(prompt)

    // Calculate next update (7 days from now)
    const nextUpdate = new Date()
    nextUpdate.setDate(nextUpdate.getDate() + 7)

    // Upsert insights (update if industry exists, insert if not)
    const { data: savedInsight, error: dbError } = await supabaseClient
      .from('industry_insights')
      .upsert({
        industry: profile.industry,
        salary_ranges: data.salary_ranges,
        growth_rate: data.growth_rate,
        demand_level: data.demand_level,
        top_skills: data.top_skills,
        market_outlook: data.market_outlook,
        key_trends: data.key_trends,
        recommended_skills: data.recommended_skills,
        next_update: nextUpdate.toISOString(),
      }, { onConflict: 'industry' })
      .select()
      .single()

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ insights: savedInsight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
