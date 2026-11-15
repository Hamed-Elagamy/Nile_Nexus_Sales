-- ============================================================================
-- Migration: 015_harden_profile_role_security.sql
-- Description: Database-level defense against unauthorized role escalation or self-deactivation.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_profile_role_modification()
RETURNS TRIGGER AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- 1. Protect role from unauthorized elevation
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    caller_role := get_user_role();
    IF caller_role != 'GM' AND COALESCE(auth.jwt() ->> 'role', '') != 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: Only General Manager (GM) can modify user roles';
    END IF;
  END IF;

  -- 2. Protect is_active from unauthorized tampering
  IF (NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
    IF NOT is_admin_or_gm() AND COALESCE(auth.jwt() ->> 'role', '') != 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: Only GM or Admin can toggle member active status';
    END IF;

    -- Prevent user self-deactivation lockout
    IF NEW.id = auth.uid() AND NEW.is_active = false THEN
      RAISE EXCEPTION 'Cannot deactivate your own account';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON profiles;
CREATE TRIGGER trg_protect_profile_roles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_profile_role_modification();
