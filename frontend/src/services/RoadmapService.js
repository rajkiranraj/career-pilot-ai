import { supabase } from "../lib/supabase";

/**
 * Call the generate-roadmap edge function to create a career transition roadmap.
 * @param {{ currentRole: string, currentSkills: string, targetRole: string, timelineMonths: number }} params
 * @returns {{ result: object }}
 */
export const generateRoadmap = async ({
  currentRole,
  currentSkills,
  targetRole,
  timelineMonths,
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be signed in to generate a roadmap.");
  }

  const { data, error } = await supabase.functions.invoke("generate-roadmap", {
    body: { currentRole, currentSkills, targetRole, timelineMonths },
  });

  if (error) {
    let msg = error.message || "Roadmap generation failed.";
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
