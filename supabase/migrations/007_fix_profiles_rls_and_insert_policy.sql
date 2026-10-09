-- ============================================================================
-- Nile Nexus Sales — Migration 007: Fix Profiles RLS, Storage & Header Size
-- Description:
--   1. Fix 494 REQUEST_HEADER_TOO_LARGE by stripping bloated avatar_url from auth.users metadata
--   2. Allow authenticated users to INSERT their own profile
--   3. Allow GM and Admin to INSERT profiles
--   4. Allow GM to DELETE profiles
--   5. Backfill missing profile records from auth.users
--   6. Setup public avatars storage bucket with RLS policies
--
-- Run this script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

-- 1. Strip bloated avatar_url from auth.users to keep JWT session token tiny (<1KB)
-- This permanently prevents 494 REQUEST_HEADER_TOO_LARGE errors.
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'avatar_url'
WHERE raw_user_meta_data ? 'avatar_url';

-- 2. Drop existing profile policies if they already exist
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_admin ON profiles;
DROP POLICY IF EXISTS profiles_delete_gm ON profiles;

-- 3. Allow authenticated users to insert their own profile
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 4. Allow GM and Admin to insert any profile
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT
  WITH CHECK (is_admin_or_gm());

-- 5. Allow GM to delete profiles
CREATE POLICY profiles_delete_gm ON profiles FOR DELETE
  USING (is_admin_or_gm());

-- 6. Backfill: ensure every user in auth.users has an active profile row
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 
  CASE 
    WHEN lower(u.email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com', 'gm@nilenexus.com') THEN 'GM'
    ELSE COALESCE(u.raw_user_meta_data->>'role', 'SALES')
  END, 
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  role = CASE 
    WHEN lower(profiles.email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com', 'gm@nilenexus.com') THEN 'GM'
    ELSE profiles.role
  END;

-- 7. Ensure avatars storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Storage bucket security policies for avatars
DROP POLICY IF EXISTS "Public avatars can be viewed by anyone" ON storage.objects;
CREATE POLICY "Public avatars can be viewed by anyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update their avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update their avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete their avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete their avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
