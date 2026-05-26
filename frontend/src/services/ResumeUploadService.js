import { supabase } from "../lib/supabase";
import { isLaravelMode } from "../lib/backendMode";
import api, { resolveApiData } from "./api";
import { extractTextFromFile } from "../utils/fileParser";

const MAX_TEXT_CHARS = 200_000;

export const parseResumeText = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Please paste your resume text first.");
  }

  if (resumeText.length > MAX_TEXT_CHARS) {
    throw new Error("Resume text exceeds the 200k character limit.");
  }

  if (isLaravelMode()) {
    const response = await api.post("/resume/parse", { resumeText });
    const data = resolveApiData(response);
    return { parsed: data?.parsed || null, partial: data?.partial || false };
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

/**
 * Parses an uploaded File by first extracting its text client-side,
 * then sending the extracted text to the resume parsing backend.
 *
 * @param {File} file - The uploaded file object
 * @param {function} onProgress - Progress callback
 */
export const parseResumeFile = async (file, onProgress) => {
  if (!file) {
    throw new Error("Please select a file first.");
  }

  const extractedText = await extractTextFromFile(file, onProgress);

  if (!extractedText || !extractedText.trim()) {
    throw new Error("Could not extract any readable text from the file.");
  }

  const parseResult = await parseResumeText(extractedText);
  return {
    ...parseResult,
    extractedText,
  };
};

