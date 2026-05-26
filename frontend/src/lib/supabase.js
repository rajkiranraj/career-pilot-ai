import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseFunctionsUrl =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || supabaseUrl;

export const getAuthRedirectUrl = () => {
  const configured = import.meta.env.VITE_AUTH_REDIRECT_URL;
  if (configured) return configured;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/login`;
  }

  return "";
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.",
  );
}

export const supabase = createClient(supabaseUrl || "http://localhost", supabaseAnonKey || "dummy", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "X-Client-Info": "career-pilot-ai",
    },
  },
  functionsUrl: supabaseFunctionsUrl,
});
