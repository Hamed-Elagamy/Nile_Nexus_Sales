-- ============================================================================
-- Nile Nexus Sales — Migration 008: Prepare Database for Production
-- Description:
--   1. Purge all placeholder test/sample records (potential clients, clients,
--      deals, proposals, follow-ups, tasks, activities, approvals, notifications).
--   2. Remove fake seed accounts (gm@nilenexus.com, admin@nilenexus.com, sales@nilenexus.com).
--   3. Strictly preserve REAL company accounts:
--      - Mohamed Hamed (hamedelagamy00@gmail.com) -> Role: GM
--      - Reem Ezz (ezzreem726@gmail.com) -> Role: GM
--      - Any other real employee accounts registered in auth.users
--   4. Strictly preserve all system configuration:
--      - pipeline_stages, lead_sources, lost_reasons, services,
--      - settings, feature_flags, permissions, role_permissions,
--      - payment_term_templates, storage buckets
--   5. Reset business ID sequences so the first real business entries begin at 00001:
--      - PC-00001 (Potential Clients)
--      - CLIENT-00001 (Clients)
--      - DEAL-00001 (Deals)
--      - NN-Q-00001 (Proposals)
--      - TASK-00001 (Tasks)
--
-- Run this script directly in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

BEGIN;

-- 1. Remove sample business records in foreign key dependency order
DELETE FROM activities;
DELETE FROM notifications;
DELETE FROM audit_logs;

DELETE FROM proposal_items;
DELETE FROM proposal_versions;
DELETE FROM proposals;

DELETE FROM meeting_participants;
DELETE FROM meetings;
DELETE FROM tasks;
DELETE FROM follow_ups;
DELETE FROM approvals;

DELETE FROM deal_services;
DELETE FROM deal_tags;
DELETE FROM deals;

DELETE FROM contacts;
DELETE FROM client_tags;
DELETE FROM clients;

DELETE FROM potential_client_opportunities;
DELETE FROM potential_clients;

-- 2. Remove fake seed demo users from profiles and auth.users
DELETE FROM profiles 
WHERE lower(email) IN ('gm@nilenexus.com', 'admin@nilenexus.com', 'sales@nilenexus.com')
   OR id IN (
     '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000003'
   );

DELETE FROM auth.users 
WHERE lower(email) IN ('gm@nilenexus.com', 'admin@nilenexus.com', 'sales@nilenexus.com')
   OR id IN (
     '00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000003'
   );

-- 3. Reset business ID number sequences so production entries start clean at 00001
UPDATE number_sequences
SET current_value = 0,
    updated_at = now();

-- 4. Ensure real GM accounts are confirmed, active, and assigned GM role
UPDATE profiles
SET role = 'GM', is_active = true, updated_at = now()
WHERE lower(email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com');

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"GM"'),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE lower(email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com');

-- 5. Ensure any other real user has a synchronized profile with is_active = true
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), 
  CASE 
    WHEN lower(u.email) IN ('hamedelagamy00@gmail.com', 'ezzreem726@gmail.com') THEN 'GM'
    ELSE COALESCE(u.raw_user_meta_data->>'role', 'SALES')
  END, 
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  is_active = true;

COMMIT;
