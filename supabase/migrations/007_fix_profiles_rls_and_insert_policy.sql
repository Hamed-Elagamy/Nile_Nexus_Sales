-- ============================================================================
-- Nile Nexus Sales — Migration 007: Fix Profiles RLS Policies
-- Description:
--   1. Allow authenticated users to INSERT their own profile
--   2. Allow GM and Admin to INSERT profiles
--   3. Allow GM to DELETE profiles
--   4. Backfill missing profile records from auth.users
--
-- Run this script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

-- 1. Drop existing policies if they already exist
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_admin ON profiles;
DROP POLICY IF EXISTS profiles_delete_gm ON profiles;

-- 2. Allow authenticated users to insert their own profile
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 3. Allow GM and Admin to insert any profile
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT
  WITH CHECK (is_admin_or_gm());

-- 4. Allow GM to delete profiles
CREATE POLICY profiles_delete_gm ON profiles FOR DELETE
  USING (is_admin_or_gm());

-- 5. Backfill: ensure every user in auth.users has an active profile row
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
