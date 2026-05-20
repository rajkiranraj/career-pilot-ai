// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { generateJson } from "../shared/nvidia.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );

    // Authenticate user
    const allowBypass =
      Deno.env.get("ALLOW_TEST_BYPASS") === "true" &&
      req.headers.get("x-test-bypass") === "true";

    if (!allowBypass) {
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      const {
        data: { user },
        error: userError,
      } = await supabaseClient.auth.getUser(token);
      if (userError || !user) {
        throw new Error(`Unauthorized: ${userError?.message || "No user found"}`);
      }
    }

    const body = await req.json();
    const currentRole = body?.currentRole ?? body?.current_role;
    const currentSkills = body?.currentSkills ?? body?.current_skills;
    const targetRole = body?.targetRole ?? body?.target_role;
    const timeline = body?.timelineMonths ?? body?.timeline_months ?? "1 week";
    const jobDescription =
      body?.jobDescription ?? body?.job_description ?? body?.jdInput ?? body?.jdText ?? "";
    const hasJobDescription =
      typeof jobDescription === "string" && jobDescription.trim().length > 0;

    if (!hasJobDescription) {
      if (!currentRole?.trim() || !targetRole?.trim()) {
        throw new Error("When not providing a job description, both 'Current Role' and 'Target Role' are required.");
      }
    }

    const skills = currentSkills?.trim() || "None specified";
    const resolvedTargetRole = targetRole?.trim() || "Infer from job description";
    const resolvedCurrentRole = currentRole?.trim() || "Not specified";
    const jdText = typeof jobDescription === "string" ? jobDescription.trim() : "";

    const jdSection = hasJobDescription
      ? `\nJOB DESCRIPTION:\n${jdText.slice(0, 6000)}\n`
      : "";

    const prompt = `You are an expert career coach. Create a concise, actionable career roadmap as JSON.
${jdSection}
CURRENT ROLE: ${resolvedCurrentRole}
CURRENT SKILLS: ${skills}
TARGET ROLE: ${resolvedTargetRole}
TIMELINE: ${timeline}

IMPORTANT: Return ONLY raw JSON. No markdown code blocks, no explanation text. Start directly with {

Required JSON structure:
{"title":"...","totalMonths":"${timeline}","weeklyHours":8,"quickReviser":{"topSkills":["s1","s2","s3","s4","s5","s6"],"keyResponsibilities":["r1","r2","r3","r4"],"interviewFocus":["f1","f2","f3"]},"phases":[{"name":"Phase 1","month":"Week 1","description":"...","skills":["s1","s2"],"resources":[{"name":"...","type":"course","url":"https://..."}],"milestones":["..."],"projects":["..."]},{"name":"Phase 2","month":"Week 2","description":"...","skills":["s1","s2"],"resources":[{"name":"...","type":"course","url":"https://..."}],"milestones":["..."],"projects":["..."]},{"name":"Phase 3","month":"Week 3","description":"...","skills":["s1","s2"],"resources":[{"name":"...","type":"course","url":"https://..."}],"milestones":["..."],"projects":["..."]}],"tips":["tip1","tip2","tip3"]}

Fill in all values based on the role and timeline. Use real resource URLs. Return only valid JSON.`;

    const parsed = await generateJson(prompt, {
      systemPrompt: "You are a strict JSON generator. Return only valid JSON.",
      maxTokens: 3000,
      temperature: 0.05,
    });

    if (!parsed) {
        throw new Error("Failed to parse roadmap from AI");
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message?.includes("Unauthorized") ? 401 : 400,
      }
    );
  }
});
