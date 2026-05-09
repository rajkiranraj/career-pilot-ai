import { supabase } from "../lib/supabase";

export const getOnboardingStatus = async () => {
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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { success: false };

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

  // Cast experience to integer if present
  if (sanitized.experience !== undefined) {
    sanitized.experience = parseInt(sanitized.experience, 10) || 0;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: session.user.id, ...sanitized }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};
