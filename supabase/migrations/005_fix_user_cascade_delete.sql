-- ============================================================================
-- Nile Nexus Sales — Fix Foreign Keys & Enable User Deletion
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

-- Step 1: Automatically find and drop all foreign keys pointing to profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_schema, tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'profiles'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) ||
                ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Step 2: Re-create foreign keys with ON DELETE CASCADE or ON DELETE SET NULL
-- This ensures deleting any user from Supabase Studio never throws "Database error loading user"

ALTER TABLE potential_clients 
  ADD CONSTRAINT potential_clients_research_owner_id_fkey FOREIGN KEY (research_owner_id) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT potential_clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE clients 
  ADD CONSTRAINT clients_account_owner_id_fkey FOREIGN KEY (account_owner_id) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT clients_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE deals 
  ADD CONSTRAINT deals_sales_owner_id_fkey FOREIGN KEY (sales_owner_id) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT deals_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT deals_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE activities 
  ADD CONSTRAINT activities_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follow_ups 
  ADD CONSTRAINT follow_ups_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT follow_ups_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE meetings 
  ADD CONSTRAINT meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE meeting_participants 
  ADD CONSTRAINT meeting_participants_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE proposals 
  ADD CONSTRAINT proposals_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE proposal_versions 
  ADD CONSTRAINT proposal_versions_prepared_by_fkey FOREIGN KEY (prepared_by) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT proposal_versions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE approvals 
  ADD CONSTRAINT approvals_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE files 
  ADD CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE targets 
  ADD CONSTRAINT targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE commission_entries 
  ADD CONSTRAINT commission_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE finance_handoffs 
  ADD CONSTRAINT finance_handoffs_salesperson_id_fkey FOREIGN KEY (salesperson_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: Delete the demo accounts (gm@nilenexus.com and sales@nilenexus.com) cleanly
DELETE FROM auth.users WHERE email IN ('gm@nilenexus.com', 'sales@nilenexus.com');
DELETE FROM profiles WHERE email IN ('gm@nilenexus.com', 'sales@nilenexus.com');
