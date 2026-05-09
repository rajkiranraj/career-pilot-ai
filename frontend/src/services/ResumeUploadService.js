import { supabase } from "../lib/supabase";

const MAX_TEXT_CHARS = 200_000;

export const parseResumeText = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Please paste your resume text first.");
  }

  if (resumeText.length > MAX_TEXT_CHARS) {
    throw new Error("Resume text exceeds the 200k character limit.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("You must be signed in to upload a resume.");
  }

  const { data, error } = await supabase.functions.invoke("parse-resume", {
    body: {
      resumeText,
      mimeType: "text/plain",
      fileName: "resume.txt",
    },
  });

  if (error) {
    let msg = error.message || "Resume upload failed.";
    if (error.context && typeof error.context.json === "function") {
      try {
        const errBody = await error.context.json();
        msg = errBody.error || msg;
        if (errBody.requestId) {
          msg = `${msg} (Ref: ${errBody.requestId})`;
        }
      } catch (_) {
        /* ignore parse failure */
      }
    }
    throw new Error(msg);
  }

  return { parsed: data?.parsed || null, partial: data?.partial || false };
};
