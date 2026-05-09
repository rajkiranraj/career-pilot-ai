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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
