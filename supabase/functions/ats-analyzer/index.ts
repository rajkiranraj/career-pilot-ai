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
    const { resumeText, jobDescription } = body;

    if (!resumeText?.trim()) {
      throw new Error("Resume text is required.");
    }
    if (!jobDescription?.trim()) {
      throw new Error("Job description is required.");
    }

    const prompt = `
You are an expert ATS analyzer. Provide a brief compatibility analysis.

RESUME:
${resumeText.slice(0, 10000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 5000)}

Return ONLY a valid JSON object in exactly this format:
{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "keywords": <number 0-100>
  },
  "keywordMatch": {
    "found": ["keyword1"],
    "missing": ["keyword3"]
  },
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "tailoredSummary": "A concise, tailored professional summary."
}

Rules:
- keywordMatch.found: max 5 keywords
- keywordMatch.missing: max 5 keywords
- strengths: exactly 2
- improvements: exactly 2
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
        throw new Error("Failed to parse ATS analysis from AI");
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
