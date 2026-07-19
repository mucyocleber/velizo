-- ═══════════════════════════════════════════════════════════════════════════
-- VELIZO Storage & Schema Completion Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. SCHEMA PATCHES ────────────────────────────────────────────────────

-- Add banner_url to profiles (cover photo like LinkedIn/Facebook)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_url text;

-- ─── 2. STORAGE BUCKETS ───────────────────────────────────────────────────
-- Supabase Storage buckets are created via the storage.buckets table.
-- We create all three buckets needed by VELIZO:
--   • avatars  — profile photos and cover/banner photos
--   • resumes  — candidate CV and credential documents uploaded during apply
--   • company-logos — employer company logos

-- avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- resumes bucket (private — only accessible by owner and employer)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760,  -- 10 MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- company-logos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- ─── 3. STORAGE RLS POLICIES ──────────────────────────────────────────────

-- ── avatars bucket policies ────────────────────────────────────────────────

-- Anyone can view avatars (public bucket)
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Auth users upload avatar" ON storage.objects;
CREATE POLICY "Auth users upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update (replace) their own avatar/banner
DROP POLICY IF EXISTS "Auth users update own avatar" ON storage.objects;
CREATE POLICY "Auth users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar/banner
DROP POLICY IF EXISTS "Auth users delete own avatar" ON storage.objects;
CREATE POLICY "Auth users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── resumes bucket policies ────────────────────────────────────────────────

-- Candidates can upload resumes to their own folder
DROP POLICY IF EXISTS "Candidates upload resumes" ON storage.objects;
CREATE POLICY "Candidates upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Candidates can view their own resumes
DROP POLICY IF EXISTS "Candidates view own resumes" ON storage.objects;
CREATE POLICY "Candidates view own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Employers can view resumes uploaded for their jobs (via application lookup)
DROP POLICY IF EXISTS "Employers view applicant resumes" ON storage.objects;
CREATE POLICY "Employers view applicant resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.job_applications ja
      JOIN public.jobs j ON ja.job_id = j.id
      WHERE j.employer_id = auth.uid()
        AND ja.resume_url LIKE '%' || name || '%'
    )
  );

-- Candidates can delete their own resumes
DROP POLICY IF EXISTS "Candidates delete own resumes" ON storage.objects;
CREATE POLICY "Candidates delete own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── company-logos bucket policies ──────────────────────────────────────────

-- Public can view company logos
DROP POLICY IF EXISTS "Public company logo read" ON storage.objects;
CREATE POLICY "Public company logo read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

-- Employers can upload/update their company logo
DROP POLICY IF EXISTS "Employers upload company logo" ON storage.objects;
CREATE POLICY "Employers upload company logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Employers update company logo" ON storage.objects;
CREATE POLICY "Employers update company logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Employers delete company logo" ON storage.objects;
CREATE POLICY "Employers delete company logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── 4. MISSING RLS POLICIES (for career_passports INSERT) ────────────────

-- The trigger creates the passport, but the page also tries to insert if missing.
-- Allow candidates to insert their own career passport if one doesn't exist.
DROP POLICY IF EXISTS "Allow candidates to create own career passport" ON public.career_passports;
CREATE POLICY "Allow candidates to create own career passport"
  ON public.career_passports FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

-- ─── 5. NOTIFICATIONS RLS (SELECT/INSERT/UPDATE/DELETE) ───────────────────
-- The existing policy uses FOR ALL which covers all ops — confirm it handles SELECT.
DROP POLICY IF EXISTS "Allow users to manage own notifications" ON public.notifications;
CREATE POLICY "Allow users to manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Run the above in Supabase SQL Editor.
-- After running, verify in Storage → Buckets that you see:
--   ✅ avatars     (public)
--   ✅ resumes     (private)
--   ✅ company-logos (public)
