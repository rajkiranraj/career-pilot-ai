import api, { resolveApiData } from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

export const getOnboardingStatus = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/user/onboarding-status");
    return { success: true, data: resolveApiData(response) };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false };

  const { data, error } = await supabase
    .from("profiles")
    .select("industry")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) throw error;

  const isComplete = !!(data && data.industry);
  return { success: true, data: { isOnboarded: isComplete } };
};

export const updateUser = async (updateData) => {
  const allowedFields = [
    "name",
    "industry",
    "bio",
    "experience",
    "skills",
    "location",
  ];
  const sanitized = {};
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }


  if (sanitized.experience !== undefined) {
    sanitized.experience = parseInt(sanitized.experience, 10) || 0;
  }

  if (isLaravelMode()) {
    const response = await api.patch("/user/update", sanitized);
    return { success: true, data: resolveApiData(response) };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false };

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: session.user.id, ...sanitized }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};
