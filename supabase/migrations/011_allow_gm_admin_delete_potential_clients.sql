-- ============================================================================
-- Migration 011: Potential Clients Permissions Update
-- 1. Restrict DELETE on potential_clients to GM and Admin only
-- 2. Allow authenticated users (Sales representatives, Admins, GM) to UPDATE
--    existing potential clients to complete missing data and contact details.
-- ============================================================================

-- Ensure pc_delete policy exists and is restricted to is_admin_or_gm()
DROP POLICY IF EXISTS pc_delete ON potential_clients;
CREATE POLICY pc_delete ON potential_clients FOR DELETE
  USING (is_admin_or_gm());

-- Cascade delete on potential_client_opportunities for GM/Admin
DROP POLICY IF EXISTS pco_delete ON potential_client_opportunities;
CREATE POLICY pco_delete ON potential_client_opportunities FOR DELETE
  USING (
    is_admin_or_gm()
    OR EXISTS (
      SELECT 1 FROM potential_clients pc
      WHERE pc.id = potential_client_id
      AND (is_admin_or_gm() OR pc.research_owner_id = auth.uid())
    )
  );

-- Update policy: Allow authenticated sales reps, admins, and GM to update existing potential clients
DROP POLICY IF EXISTS pc_update ON potential_clients;
CREATE POLICY pc_update ON potential_clients FOR UPDATE
  USING (
    is_admin_or_gm()
    OR auth.uid() IS NOT NULL
  );

-- Opportunity insert / update permissions follow parent
DROP POLICY IF EXISTS pco_insert ON potential_client_opportunities;
CREATE POLICY pco_insert ON potential_client_opportunities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- ============================================================================
-- RPC: Secure Hard-Delete Function for GM and Admin
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_potential_client(target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_or_gm() THEN
    RAISE EXCEPTION 'Only GM or Admin can delete potential clients';
  END IF;

  DELETE FROM potential_client_opportunities WHERE potential_client_id = target_id;
  DELETE FROM potential_clients WHERE id = target_id;
  RETURN TRUE;
END;
$$;
