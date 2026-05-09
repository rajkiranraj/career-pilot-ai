// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { jsonrepair } from "https://esm.sh/jsonrepair@3.4.0";
import { generateWithNvidia } from "../shared/nvidia.ts";

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
          headers: { Authorization: req.headers.get("Authorization")! },
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
    const { currentRole, currentSkills, targetRole, timelineMonths } = body;

    if (!currentRole?.trim()) {
      throw new Error("Current role is required.");
    }
    if (!targetRole?.trim()) {
      throw new Error("Target role is required.");
    }

    const months = timelineMonths || 6;
    const skills = currentSkills?.trim() || "None specified";

    const prompt = `
You are an expert career coach. Create a brief, actionable career roadmap.

CURRENT ROLE: ${currentRole}
CURRENT SKILLS: ${skills}
TARGET ROLE: ${targetRole}
TIMELINE: ${months} months

Return ONLY a valid JSON object in exactly this format:
{
  "title": "From [Current Role] to [Target Role]",
  "totalMonths": ${months},
  "weeklyHours": 10,
  "phases": [
    {
      "name": "Phase name",
      "month": "Month X-Y",
      "description": "Brief description",
      "skills": ["skill1", "skill2"],
      "resources": [
        { "name": "Resource name", "type": "course", "url": "https://example.com" }
      ],
      "milestones": ["Milestone 1"],
      "projects": ["Project idea"]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Rules:
- Create exactly 3 phases
- Each phase should have exactly 2 skills, 1-2 resources with REAL URLs, 1 milestone, and 1 project idea
- Return only valid JSON.
`;

    const raw = await generateWithNvidia(prompt, {
      systemPrompt: "You are a strict JSON generator. Return only valid JSON.",
      maxTokens: 2048,
      temperature: 0.1,
    });

    const extractJson = (text: string) => {
      let cleaned = text.trim();
      const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (match) cleaned = match[1].trim();
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        cleaned = cleaned.slice(first, last + 1);
      }
      try {
        return JSON.parse(cleaned);
      } catch {
        try {
          const repaired = cleaned
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
          return JSON.parse(repaired);
        } catch {
          try {
            return JSON.parse(jsonrepair(cleaned));
          } catch {
            return null;
          }
        }
      }
    };

    const parsed = extractJson(raw);
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
