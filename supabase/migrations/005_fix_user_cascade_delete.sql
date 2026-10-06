-- ============================================================================
-- Nile Nexus Sales — Fix User Delete & Cascade Constraints
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

-- 1. Reassign or Clean up demo GM user data and delete gm@nilenexus.com
DO $$
DECLARE
  v_new_gm_id UUID;
  v_old_gm_id UUID;
BEGIN
  SELECT id INTO v_new_gm_id FROM auth.users WHERE email = 'hamedelagamy00@gmail.com';
  SELECT id INTO v_old_gm_id FROM auth.users WHERE email = 'gm@nilenexus.com';

  IF v_old_gm_id IS NOT NULL THEN
    IF v_new_gm_id IS NOT NULL THEN
      -- Reassign existing records to your account
      UPDATE potential_clients SET created_by = v_new_gm_id WHERE created_by = v_old_gm_id;
      UPDATE clients SET created_by = v_new_gm_id WHERE created_by = v_old_gm_id;
      UPDATE deals SET created_by = v_new_gm_id WHERE created_by = v_old_gm_id;
    ELSE
      DELETE FROM deals WHERE created_by = v_old_gm_id;
      DELETE FROM clients WHERE created_by = v_old_gm_id;
      DELETE FROM potential_clients WHERE created_by = v_old_gm_id;
    END IF;

    -- Delete the demo GM profile and auth user
    DELETE FROM profiles WHERE id = v_old_gm_id;
    DELETE FROM auth.users WHERE id = v_old_gm_id;
  END IF;
END $$;

-- 2. Drop and Re-add Foreign Keys on tables with ON DELETE CASCADE / SET NULL
-- This ensures deleting ANY user from Supabase Dashboard UI succeeds without errors.

-- Potential Clients
ALTER TABLE potential_clients DROP CONSTRAINT IF EXISTS potential_clients_research_owner_id_fkey;
ALTER TABLE potential_clients ADD CONSTRAINT potential_clients_research_owner_id_fkey 
  FOREIGN KEY (research_owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE potential_clients DROP CONSTRAINT IF EXISTS potential_clients_created_by_fkey;
ALTER TABLE potential_clients ADD CONSTRAINT potential_clients_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Clients
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_account_owner_id_fkey;
ALTER TABLE clients ADD CONSTRAINT clients_account_owner_id_fkey 
  FOREIGN KEY (account_owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;
ALTER TABLE clients ADD CONSTRAINT clients_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_updated_by_fkey;
ALTER TABLE clients ADD CONSTRAINT clients_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Deals
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_sales_owner_id_fkey;
ALTER TABLE deals ADD CONSTRAINT deals_sales_owner_id_fkey 
  FOREIGN KEY (sales_owner_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_created_by_fkey;
ALTER TABLE deals ADD CONSTRAINT deals_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_updated_by_fkey;
ALTER TABLE deals ADD CONSTRAINT deals_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Activities
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_actor_id_fkey;
ALTER TABLE activities ADD CONSTRAINT activities_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Follow-ups
ALTER TABLE follow_ups DROP CONSTRAINT IF EXISTS follow_ups_responsible_id_fkey;
ALTER TABLE follow_ups ADD CONSTRAINT follow_ups_responsible_id_fkey 
  FOREIGN KEY (responsible_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follow_ups DROP CONSTRAINT IF EXISTS follow_ups_created_by_fkey;
ALTER TABLE follow_ups ADD CONSTRAINT follow_ups_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey 
  FOREIGN KEY (assignee_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Proposals
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_created_by_fkey;
ALTER TABLE proposals ADD CONSTRAINT proposals_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE proposal_versions DROP CONSTRAINT IF EXISTS proposal_versions_prepared_by_fkey;
ALTER TABLE proposal_versions ADD CONSTRAINT proposal_versions_prepared_by_fkey 
  FOREIGN KEY (prepared_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE proposal_versions DROP CONSTRAINT IF EXISTS proposal_versions_approved_by_fkey;
ALTER TABLE proposal_versions ADD CONSTRAINT proposal_versions_approved_by_fkey 
  FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Approvals
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_requester_id_fkey;
ALTER TABLE approvals ADD CONSTRAINT approvals_requester_id_fkey 
  FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_approver_id_fkey;
ALTER TABLE approvals ADD CONSTRAINT approvals_approver_id_fkey 
  FOREIGN KEY (approver_id) REFERENCES profiles(id) ON DELETE SET NULL;
