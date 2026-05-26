import api from "./api";
import { isLaravelMode } from "../lib/backendMode";
import { supabase } from "../lib/supabase";

// ── In-memory cache (15-min TTL) ──────────────────────────────
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

const getCacheKey = (params) => JSON.stringify(params);

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ── Fetch remote jobs ─────────────────────────────────────────
export const fetchRemoteJobs = async ({
  category = "",
  search = "",
  limit = 250,
} = {}) => {
  const params = { category, search, limit };
  const cacheKey = getCacheKey(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (isLaravelMode()) {
    // Proxy through Laravel backend
    const queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if (search) queryParams.append("search", search);
    if (limit) queryParams.append("limit", String(limit));
    const qs = queryParams.toString();

    const response = await api.get(`/remote-jobs${qs ? `?${qs}` : ""}`);
    const jobs = response?.data?.jobs || response?.jobs || [];
    setCache(cacheKey, jobs);
    return jobs;
  }

  // Supabase mode — call Remotive API directly
  const queryParams = new URLSearchParams();
  if (category) queryParams.append("category", category);
  if (search) queryParams.append("search", search);
  if (limit) queryParams.append("limit", String(limit));
  const qs = queryParams.toString();

  const res = await fetch(
    `https://remotive.com/api/remote-jobs${qs ? `?${qs}` : ""}`,
  );

  if (!res.ok) throw new Error("Failed to fetch remote jobs");

  const data = await res.json();
  const jobs = data?.jobs || [];
  setCache(cacheKey, jobs);
  return jobs;
};

// ── Fetch job categories ──────────────────────────────────────
let categoriesCache = null;

export const fetchJobCategories = async () => {
  if (categoriesCache) return categoriesCache;

  const res = await fetch(
    "https://remotive.com/api/remote-jobs/categories",
  );

  if (!res.ok) throw new Error("Failed to fetch categories");

  const data = await res.json();
  const categories = data?.jobs || data || [];
  categoriesCache = categories;
  return categories;
};

// ── Get saved jobs ────────────────────────────────────────────
export const getSavedJobs = async () => {
  if (isLaravelMode()) {
    const response = await api.get("/remote-jobs/saved");
    return response?.data || response || [];
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", session.user.id)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved jobs:", error);
    return [];
  }

  return data || [];
};

// ── Save a job ────────────────────────────────────────────────
export const saveJob = async (job) => {
  const payload = {
    remotive_job_id: job.id,
    title: job.title,
    company_name: job.company_name,
    company_logo: job.company_logo || null,
    job_url: job.url,
    salary: job.salary || null,
    job_type: job.job_type || null,
    location: job.candidate_required_location || null,
    category: job.category || null,
  };

  if (isLaravelMode()) {
    const response = await api.post("/remote-jobs/save", payload);
    return response?.data || response;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("saved_jobs")
    .insert({ ...payload, user_id: session.user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ── Unsave a job ──────────────────────────────────────────────
export const unsaveJob = async (remotiveJobId) => {
  if (isLaravelMode()) {
    await api.delete(`/remote-jobs/saved/${remotiveJobId}`);
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", session.user.id)
    .eq("remotive_job_id", remotiveJobId);

  if (error) throw error;
};
