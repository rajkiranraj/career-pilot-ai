export const getBackendMode = () => {
  const defaultMode = import.meta.env.DEV ? "laravel" : "supabase";
  const raw = import.meta.env.VITE_BACKEND_MODE || defaultMode;
  const normalized = String(raw).trim().toLowerCase();
  return normalized === "laravel" ? "laravel" : "supabase";
};

export const isLaravelMode = () => getBackendMode() === "laravel";
