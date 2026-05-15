import api, { resolveApiData } from "./api";
import { supabase, getAuthRedirectUrl } from "../lib/supabase";
import { isLaravelMode } from "../lib/backendMode";

const ensureCsrfCookie = async () => {
  await api.get("/sanctum/csrf-cookie");
};

export const signIn = async ({ email, password }) => {
  if (!isLaravelMode()) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { session: true };
  }

  await ensureCsrfCookie();
  await api.post("/login", { email, password });
  return { session: true };
};

export const signUp = async ({ name, email, password }) => {
  if (!isLaravelMode()) {
    const redirectTo = getAuthRedirectUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    });

    if (error) throw error;
    return { session: data?.session || null };
  }

  await ensureCsrfCookie();
  await api.post("/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return { session: true };
};

export const signOut = async () => {
  if (!isLaravelMode()) {
    await supabase.auth.signOut();
    return;
  }

  await ensureCsrfCookie();
  await api.post("/logout");
};

export const resetPassword = async (email) => {
  if (!isLaravelMode()) {
    const redirectTo = getAuthRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined,
    );
    if (error) throw error;
    return;
  }

  await ensureCsrfCookie();
  await api.post("/forgot-password", { email });
};

export const getCurrentUser = async () => {
  if (!isLaravelMode()) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user || null;
  }

  const response = await api.get("/user/me");
  return resolveApiData(response) || null;
};
