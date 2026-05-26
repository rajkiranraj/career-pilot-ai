import { supabase } from "../lib/supabase";
import { isLaravelMode } from "../lib/backendMode";
import api, { resolveApiData } from "./api";

/**
 * Call the enhance-text edge function to improve resume text.
 * @param {string} text    — the text to enhance
 * @param {string} type    — prompt type: summary | experience | project | skills | achievement | coursework | honors | ats_fix | general
 * @returns {Promise<{ improved?: string, ats_fix?: object }>}
 */
export const enhanceText = async (text, type = "general") => {
  if (!text?.trim()) {
    throw new Error("Please enter content to enhance.");
  }

  if (isLaravelMode()) {
    const response = await api.post("/enhance-text", { text, type });
    const data = resolveApiData(response);
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed;
  }

  const { data, error } = await supabase.functions.invoke("enhance-text", {
    body: { text, type },
  });

  if (error) {
    let msg = error.message || "Text enhancement failed.";
    if (error.context && typeof error.context.json === "function") {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
      } catch (_) {
        /* ignore parse failure */
      }
    }
    throw new Error(msg);
  }

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed;
  } catch {
    throw new Error("AI returned a malformed response. Please retry.");
  }
};
