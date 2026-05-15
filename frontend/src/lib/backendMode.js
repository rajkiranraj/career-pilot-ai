export const getBackendMode = () => {
  const raw = import.meta.env.VITE_BACKEND_MODE || "supabase";
  const normalized = String(raw).trim().toLowerCase();
  return normalized === "laravel" ? "laravel" : "supabase";
};

export const isLaravelMode = () => getBackendMode() === "laravel";
