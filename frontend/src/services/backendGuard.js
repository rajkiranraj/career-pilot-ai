import { isLaravelMode } from "../lib/backendMode";

export const ensureSupabaseMode = (featureName) => {
  if (isLaravelMode()) {
    throw new Error(
      `${featureName} is only available when VITE_BACKEND_MODE=supabase.`,
    );
  }
};
