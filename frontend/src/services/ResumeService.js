import api, { resolveApiData } from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

export const getResume = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/resume");
    return { success: true, data: resolveApiData(response) || null };
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return { success: true, data: data || null };
};

export const saveResume = async (content) => {
  if (isLaravelMode()) {
    const response = await api.post("/resume/save", { content });
    return { success: true, data: resolveApiData(response) };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("resumes")
    .insert({ user_id: session?.user?.id, content })
    .select()
    .maybeSingle();

  if (error) throw error;
  return { success: true, data };
};

export const improveResumeContent = async (current, type) => {
  if (isLaravelMode()) {
    const response = await api.post("/resume/improve", { current, type });
    return { success: true, data: resolveApiData(response) };
  }

  const { data, error } = await supabase.functions.invoke("improve-resume", {
    body: { resumeContent: current, type },
  });

  if (error) {
    let msg = error.message || "Failed to improve resume";
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

  return { success: true, data };
};
