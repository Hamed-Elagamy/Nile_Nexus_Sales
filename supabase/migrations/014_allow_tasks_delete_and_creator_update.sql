-- ============================================================================
-- Migration 014: Allow GM, Admin, and Creator to Delete and Update Tasks
-- ============================================================================

-- 1. Enable deletion for GM, Admin, and the task creator
DROP POLICY IF EXISTS tasks_delete ON tasks;
CREATE POLICY tasks_delete ON tasks FOR DELETE
  USING (
    is_admin_or_gm()
    OR created_by = auth.uid()
  );

-- 2. Enhance update policy to allow creator as well as assignee and GM/Admin
DROP POLICY IF EXISTS tasks_update ON tasks;
CREATE POLICY tasks_update ON tasks FOR UPDATE
  USING (
    is_admin_or_gm()
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  );
