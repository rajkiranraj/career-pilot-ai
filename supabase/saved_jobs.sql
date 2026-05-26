-- =============================================================
-- Remote Jobs: saved_jobs table for Career Pilot AI
-- Run this in your Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  remotive_job_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  job_url TEXT NOT NULL,
  salary TEXT,
  job_type TEXT,
  location TEXT,
  category TEXT,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, remotive_job_id)
);

-- Enable Row-Level Security
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved jobs
CREATE POLICY "Users can view own saved jobs"
  ON saved_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own saved jobs
CREATE POLICY "Users can insert own saved jobs"
  ON saved_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved jobs
CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_remotive_job_id ON saved_jobs(remotive_job_id);
