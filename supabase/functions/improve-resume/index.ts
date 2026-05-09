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
      },
    );

    const allowBypass =
      Deno.env.get("ALLOW_TEST_BYPASS") === "true" &&
      req.headers.get("x-test-bypass") === "true";
    let user: { id: string } | null = null;

    if (allowBypass) {
      user = { id: "test-bypass" };
    } else {
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      const {
        data: { user: authUser },
        error: userError,
      } = await supabaseClient.auth.getUser(token);
      if (userError || !authUser) {
        throw new Error("Unauthorized");
      }
      user = authUser;
    }

    const { resumeContent } = await req.json();

    if (!resumeContent) {
      throw new Error("resumeContent is required");
    }

    // Get user profile for context
    let profile: { industry?: string; skills?: string[] } | null = null;
    if (allowBypass) {
      profile = { industry: "Software Engineering", skills: [] };
    } else {
      const { data } = await supabaseClient
        .from("profiles")
        .select("industry, skills")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    }

    const industryContext = profile?.industry
      ? `Target Industry: ${profile.industry}`
      : "";

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
    const scoreMatch = raw.match(/"ats_score"\s*:\s*(\d+)/i);
    const fallbackScore = scoreMatch ? Number(scoreMatch[1]) : null;
    const data = parsed || {
      ats_score: Number.isFinite(fallbackScore) ? fallbackScore : null,
      feedback: raw,
      _parseWarning: "AI returned non-JSON response",
    };

    // Try to save to DB, but don't fail if the table doesn't exist
    let resume: any = null;
    let dbSaveFailed = false;
    if (!allowBypass) {
      try {
        const { data: inserted, error: dbError } = await supabaseClient
          .from("resumes")
          .insert({
            user_id: user.id,
            content: resumeContent,
            ats_score: data.ats_score,
            feedback: data.feedback,
          })
          .select()
          .single();

        if (dbError) {
          console.error("DB insert warning (non-critical):", dbError.message);
          dbSaveFailed = true;
        } else {
          resume = inserted;
        }
      } catch (dbErr: any) {
        console.error("DB insert warning (non-critical):", dbErr.message);
        dbSaveFailed = true;
      }
    }

    // If DB save failed or bypassing, return the data directly so the user still gets their feedback
    if (!resume) {
      resume = {
        id: `temp-${Date.now()}`,
        content: resumeContent,
        ats_score: data.ats_score,
        feedback: data.feedback,
        created_at: new Date().toISOString(),
        _dbSaveFailed: dbSaveFailed || allowBypass,
        _bypass: allowBypass,
      };
    }

    return new Response(JSON.stringify({ resume }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("improve-resume error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to improve resume" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
