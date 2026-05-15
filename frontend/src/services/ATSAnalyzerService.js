import { supabase } from "../lib/supabase";
import { ensureSupabaseMode } from "./backendGuard";

/**
 * Call the ats-analyzer edge function to compare resume against a JD.
 * @param {string} resumeText  — plain-text resume content
 * @param {string} jobDescription — job description text
 * @returns {{ result: object }}
 */
export const analyzeATS = async (resumeText, jobDescription) => {
  ensureSupabaseMode("ATS Analyzer");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be signed in to use the ATS analyzer.");
  }

  const { data, error } = await supabase.functions.invoke("ats-analyzer", {
    body: { resumeText, jobDescription },
  });

  if (error) {
    let msg = error.message || "ATS analysis failed.";
    if (error.context && typeof error.context.json === "function") {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
      } catch (_) {
        /* ignore */
      }
    }
    throw new Error(msg);
  }

  return data?.result || null;
};
