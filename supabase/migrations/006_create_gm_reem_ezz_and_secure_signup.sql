-- ============================================================================
-- Nile Nexus Sales — Migration 006:
-- 1. Create & Confirm GM Account for Reem Ezz (ezzreem726@gmail.com)
-- 2. Confirm GM Role for Mohamed Hamed (Hamedelagamy00@gmail.com)
-- 3. Secure Public Signup: Strictly lock new signups to 'SALES' role
--
-- Run this script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  -- 1. Ensure Reem Ezz (ezzreem726@gmail.com) exists with confirmed status and GM role
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'ezzreem726@gmail.com') THEN
    UPDATE auth.users
    SET encrypted_password = crypt('NileNexus2026!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', 'Reem Ezz', 'role', 'GM'),
        updated_at = now()
    WHERE lower(email) = 'ezzreem726@gmail.com';
  ELSE
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated', 'authenticated',
      'ezzreem726@gmail.com',
      crypt('NileNexus2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Reem Ezz","role":"GM"}',
      now(), now()
    );
  END IF;

  -- 2. Ensure Mohamed Hamed has GM role confirmed
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'hamedelagamy00@gmail.com') THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"GM"'),
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE lower(email) = 'hamedelagamy00@gmail.com';
  END IF;
END $$;

-- 3. Upsert into profiles for Reem Ezz
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Reem Ezz', 'GM', true
FROM auth.users
WHERE lower(email) = 'ezzreem726@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'GM',
  full_name = 'Reem Ezz',
  is_active = true;

-- 4. Ensure Mohamed Hamed profile has GM role
UPDATE profiles
SET role = 'GM'
WHERE lower(email) = 'hamedelagamy00@gmail.com';

-- 5. Harden handle_new_user() trigger function:
-- Force ANY public signup to strictly receive the 'SALES' role.
-- Only the authorized whitelisted GM emails get GM status automatically.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'SALES';
BEGIN
  -- Whitelist authorized GM emails:
  IF lower(NEW.email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com', 'gm@nilenexus.com') THEN
    v_role := 'GM';
  ELSE
    -- Anyone else signing up publicly is ALWAYS forced to SALES
    v_role := 'SALES';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = CASE 
      WHEN lower(profiles.email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com', 'gm@nilenexus.com') THEN 'GM'
      ELSE profiles.role 
    END,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
