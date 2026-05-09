// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  ResumeParseError,
  buildResumePrompt,
  parseAiResponse,
  prepareResumeInput,
  truncateText,
} from "./lib.ts";
import { generateWithNvidia } from "../shared/nvidia.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const getEnvNumber = (key: string, fallback: number) => {
  const raw = Deno.env.get(key);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const log = (stage: string, meta?: Record<string, unknown>) => {
    const elapsed = Math.round(performance.now() - startedAt);
    if (meta) {
      console.log(`[parse-resume][${requestId}] ${stage}`, meta, `+${elapsed}ms`);
    } else {
      console.log(`[parse-resume][${requestId}] ${stage} +${elapsed}ms`);
    }
  };

  log("request.start", { method: req.method, url: req.url });

  if (req.method === "OPTIONS") {
    log("cors.preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    log("auth.init");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      },
    );

    const allowBypass =
      Deno.env.get("ALLOW_TEST_BYPASS") === "true" &&
      req.headers.get("x-test-bypass") === "true";
    let user: { id: string } | null = null;

    if (allowBypass) {
      log("auth.bypass");
      user = { id: "test-bypass" };
    } else {
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      log("auth.start");
      const {
        data: { user: authUser },
        error: userError,
      } = await supabaseClient.auth.getUser(token);
      if (userError || !authUser) {
        log("auth.fail", { error: userError?.message || "missing user" });
        throw new ResumeParseError("Unauthorized", 401, "UNAUTHORIZED");
      }
      user = authUser;
      if (user) log("auth.success", { userId: user.id });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch (error: any) {
      throw new ResumeParseError(
        "Invalid JSON body. Please retry the upload.",
        400,
        "INVALID_JSON",
        { reason: String(error?.message || "Unknown error") },
      );
    }

    const fileBase64 = body?.fileBase64;
    const mimeType = body?.mimeType;
    const fileName = body?.fileName;
    const fileSize = body?.fileSize;
    const resumeText = body?.resumeText;
    log("payload.received", {
      mimeType,
      fileName,
      fileSize,
      resumeTextLength: typeof resumeText === "string" ? resumeText.length : null,
      base64Length: typeof fileBase64 === "string" ? fileBase64.length : null,
    });

    const prepared = await prepareResumeInput({
      fileBase64,
      mimeType,
      fileName,
      resumeText,
    });
    log("payload.normalized", {
      mode: prepared.mode,
      mimeType: prepared.mimeType,
      sizeBytes: prepared.sizeBytes,
      warnings: prepared.warnings,
    });

    const prompt = buildResumePrompt();
    const maxInputChars = getEnvNumber("NVIDIA_MAX_INPUT_CHARS", 30_000);
    let resumeTextForPrompt = prepared.text || "";
    const inputWarnings: string[] = [];
    if (resumeTextForPrompt.length > maxInputChars) {
      resumeTextForPrompt = truncateText(resumeTextForPrompt, maxInputChars);
      inputWarnings.push("NIM_INPUT_TRUNCATED");
    }
    const userMessage = `${prompt}\n\nRESUME_TEXT:\n${resumeTextForPrompt}`;

    // Use the same generateWithNvidia helper that enhance-text uses
    log("nvidia.request", { mode: prepared.mode });
    const text = await generateWithNvidia(userMessage, {
      systemPrompt: "You are a strict JSON generator. Return only valid JSON. Extract every field thoroughly.",
      maxTokens: getEnvNumber("NVIDIA_MAX_TOKENS", 4096),
      temperature: 0.1,
      topP: 0.7,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
    log("nvidia.output", { textLength: text.length });

    if (!text.trim()) {
      throw new ResumeParseError(
        "AI returned an empty response.",
        502,
        "EMPTY_AI_RESPONSE",
      );
    }

    const { parsed, partial, warnings } = parseAiResponse(text);
    const responseWarnings = [...prepared.warnings, ...inputWarnings, ...warnings];
    log("parse.complete", {
      partial,
      warnings: responseWarnings,
      skills: parsed.skills.length,
      education: parsed.education.length,
      experience: parsed.experience.length,
      projects: parsed.projects.length,
      certifications: parsed.certifications.length,
      achievements: parsed.achievements.length,
      hasSummary: !!parsed.summary,
      hasTargetRole: !!parsed.target_role,
      hasLinkedin: !!parsed.linkedin,
      hasGithub: !!parsed.github,
    });

    return new Response(
      JSON.stringify({
        parsed,
        partial,
        warnings: responseWarnings,
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    const status =
      error instanceof ResumeParseError
        ? error.status
        : Number.isFinite(error?.status)
          ? error.status
          : 500;
    const code =
      error instanceof ResumeParseError
        ? error.code
        : error?.code || "INTERNAL_ERROR";
    const message =
      error instanceof ResumeParseError
        ? error.message
        : error?.message || "An unexpected error occurred. Please try again.";
    log("error", {
      message: error?.message || message,
      code,
      status,
      stack: error?.stack,
    });
    return new Response(
      JSON.stringify({
        error: message,
        code,
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status,
      },
    );
  }
});
