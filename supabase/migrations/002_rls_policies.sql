-- ============================================================================
-- Nile Nexus Sales — Row Level Security Policies
-- Migration: 002_rls_policies
-- Description: RLS policies enforcing role-based access control
-- ============================================================================

-- ============================================================================
-- Helper function: Get current user's role
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper: Check if current user is GM or ADMIN
CREATE OR REPLACE FUNCTION is_admin_or_gm()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('GM', 'ADMIN')
    AND is_active = true
  );
$$;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE potential_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE potential_client_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_term_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES
-- ============================================================================
-- Everyone can read active profiles (needed for assignments, display names)
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- GM/Admin can update any profile
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE
  USING (is_admin_or_gm());

-- Users can insert their own profile
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- GM/Admin can insert any profile
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT
  WITH CHECK (is_admin_or_gm());

-- GM can delete profiles
CREATE POLICY profiles_delete_gm ON profiles FOR DELETE
  USING (is_admin_or_gm());

-- ============================================================================
-- REFERENCE DATA (read by everyone, managed by admin)
-- ============================================================================
-- Lead Sources
CREATE POLICY lead_sources_select ON lead_sources FOR SELECT USING (true);
CREATE POLICY lead_sources_manage ON lead_sources FOR ALL USING (is_admin_or_gm());

-- Lost Reasons
CREATE POLICY lost_reasons_select ON lost_reasons FOR SELECT USING (true);
CREATE POLICY lost_reasons_manage ON lost_reasons FOR ALL USING (is_admin_or_gm());

-- Tags
CREATE POLICY tags_select ON tags FOR SELECT USING (true);
CREATE POLICY tags_insert ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY tags_manage ON tags FOR ALL USING (is_admin_or_gm());

-- Services
CREATE POLICY services_select ON services FOR SELECT USING (true);
CREATE POLICY services_manage ON services FOR ALL USING (is_admin_or_gm());

-- Pipeline Stages
CREATE POLICY pipeline_stages_select ON pipeline_stages FOR SELECT USING (true);
CREATE POLICY pipeline_stages_manage ON pipeline_stages FOR ALL USING (is_admin_or_gm());

-- Permissions (reference data)
CREATE POLICY permissions_select ON permissions FOR SELECT USING (true);
CREATE POLICY permissions_manage ON permissions FOR ALL USING (is_admin_or_gm());

CREATE POLICY role_permissions_select ON role_permissions FOR SELECT USING (true);
CREATE POLICY role_permissions_manage ON role_permissions FOR ALL USING (is_admin_or_gm());

-- ============================================================================
-- POTENTIAL CLIENTS
-- ============================================================================
-- Sales: see own; GM/Admin: see all
CREATE POLICY pc_select ON potential_clients FOR SELECT
  USING (
    is_admin_or_gm()
    OR research_owner_id = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY pc_insert ON potential_clients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY pc_update ON potential_clients FOR UPDATE
  USING (
    is_admin_or_gm()
    OR research_owner_id = auth.uid()
  );

-- Opportunities follow parent
CREATE POLICY pco_select ON potential_client_opportunities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM potential_clients pc
      WHERE pc.id = potential_client_id
      AND (is_admin_or_gm() OR pc.research_owner_id = auth.uid() OR pc.created_by = auth.uid())
    )
  );

CREATE POLICY pco_insert ON potential_client_opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM potential_clients pc
      WHERE pc.id = potential_client_id
      AND (is_admin_or_gm() OR pc.research_owner_id = auth.uid())
    )
  );

CREATE POLICY pco_delete ON potential_client_opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM potential_clients pc
      WHERE pc.id = potential_client_id
      AND (is_admin_or_gm() OR pc.research_owner_id = auth.uid())
    )
  );

-- ============================================================================
-- CLIENTS
-- ============================================================================
CREATE POLICY clients_select ON clients FOR SELECT
  USING (
    is_admin_or_gm()
    OR account_owner_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM deals d WHERE d.client_id = id AND d.sales_owner_id = auth.uid()
    )
  );

CREATE POLICY clients_insert ON clients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY clients_update ON clients FOR UPDATE
  USING (
    is_admin_or_gm()
    OR account_owner_id = auth.uid()
  );

-- ============================================================================
-- CONTACTS (follow client access)
-- ============================================================================
CREATE POLICY contacts_select ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND (is_admin_or_gm() OR c.account_owner_id = auth.uid() OR c.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM deals d WHERE d.client_id = c.id AND d.sales_owner_id = auth.uid()))
    )
  );

CREATE POLICY contacts_insert ON contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND (is_admin_or_gm() OR c.account_owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM deals d WHERE d.client_id = c.id AND d.sales_owner_id = auth.uid()))
    )
  );

CREATE POLICY contacts_update ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND (is_admin_or_gm() OR c.account_owner_id = auth.uid())
    )
  );

-- ============================================================================
-- CLIENT TAGS / DEAL TAGS (follow parent access)
-- ============================================================================
CREATE POLICY client_tags_select ON client_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND (is_admin_or_gm() OR c.account_owner_id = auth.uid() OR c.created_by = auth.uid())
    )
  );

CREATE POLICY client_tags_manage ON client_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND (is_admin_or_gm() OR c.account_owner_id = auth.uid())
    )
  );

CREATE POLICY deal_tags_select ON deal_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
      AND (is_admin_or_gm() OR d.sales_owner_id = auth.uid())
    )
  );

CREATE POLICY deal_tags_manage ON deal_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
      AND (is_admin_or_gm() OR d.sales_owner_id = auth.uid())
    )
  );

-- ============================================================================
-- DEALS
-- ============================================================================
CREATE POLICY deals_select ON deals FOR SELECT
  USING (
    is_admin_or_gm()
    OR sales_owner_id = auth.uid()
  );

CREATE POLICY deals_insert ON deals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY deals_update ON deals FOR UPDATE
  USING (
    is_admin_or_gm()
    OR sales_owner_id = auth.uid()
  );

-- Deal Services (follow deal access)
CREATE POLICY deal_services_select ON deal_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals d WHERE d.id = deal_id
      AND (is_admin_or_gm() OR d.sales_owner_id = auth.uid())
    )
  );

CREATE POLICY deal_services_manage ON deal_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deals d WHERE d.id = deal_id
      AND (is_admin_or_gm() OR d.sales_owner_id = auth.uid())
    )
  );

-- ============================================================================
-- ACTIVITIES (follow client/deal access)
-- ============================================================================
CREATE POLICY activities_select ON activities FOR SELECT
  USING (
    is_admin_or_gm()
    OR actor_id = auth.uid()
    OR (client_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM clients c WHERE c.id = client_id
      AND (c.account_owner_id = auth.uid() OR c.created_by = auth.uid())
    ))
    OR (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d WHERE d.id = deal_id AND d.sales_owner_id = auth.uid()
    ))
  );

CREATE POLICY activities_insert ON activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- FOLLOW-UPS
-- ============================================================================
CREATE POLICY follow_ups_select ON follow_ups FOR SELECT
  USING (
    is_admin_or_gm()
    OR responsible_id = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY follow_ups_insert ON follow_ups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY follow_ups_update ON follow_ups FOR UPDATE
  USING (
    is_admin_or_gm()
    OR responsible_id = auth.uid()
  );

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE POLICY tasks_select ON tasks FOR SELECT
  USING (
    is_admin_or_gm()
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY tasks_insert ON tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY tasks_update ON tasks FOR UPDATE
  USING (
    is_admin_or_gm()
    OR assignee_id = auth.uid()
  );

-- ============================================================================
-- MEETINGS
-- ============================================================================
CREATE POLICY meetings_select ON meetings FOR SELECT
  USING (
    is_admin_or_gm()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM meeting_participants mp WHERE mp.meeting_id = id AND mp.profile_id = auth.uid()
    )
  );

CREATE POLICY meetings_insert ON meetings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY meetings_update ON meetings FOR UPDATE
  USING (
    is_admin_or_gm()
    OR created_by = auth.uid()
  );

CREATE POLICY meeting_participants_select ON meeting_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings m WHERE m.id = meeting_id
      AND (is_admin_or_gm() OR m.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM meeting_participants mp2 WHERE mp2.meeting_id = m.id AND mp2.profile_id = auth.uid()))
    )
  );

CREATE POLICY meeting_participants_manage ON meeting_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meetings m WHERE m.id = meeting_id
      AND (is_admin_or_gm() OR m.created_by = auth.uid())
    )
  );

-- ============================================================================
-- PROPOSALS (follow deal access)
-- ============================================================================
CREATE POLICY proposals_select ON proposals FOR SELECT
  USING (
    is_admin_or_gm()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM deals d WHERE d.id = deal_id AND d.sales_owner_id = auth.uid()
    )
  );

CREATE POLICY proposals_insert ON proposals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY proposals_update ON proposals FOR UPDATE
  USING (
    is_admin_or_gm()
    OR created_by = auth.uid()
  );

-- Proposal Versions
CREATE POLICY pv_select ON proposal_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals p WHERE p.id = proposal_id
      AND (is_admin_or_gm() OR p.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM deals d WHERE d.id = p.deal_id AND d.sales_owner_id = auth.uid()))
    )
  );

CREATE POLICY pv_insert ON proposal_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals p WHERE p.id = proposal_id
      AND (is_admin_or_gm() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY pv_update ON proposal_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals p WHERE p.id = proposal_id
      AND (is_admin_or_gm() OR p.created_by = auth.uid())
    )
  );

-- Proposal Items
CREATE POLICY pi_select ON proposal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposal_versions pv
      JOIN proposals p ON p.id = pv.proposal_id
      WHERE pv.id = proposal_version_id
      AND (is_admin_or_gm() OR p.created_by = auth.uid())
    )
  );

CREATE POLICY pi_manage ON proposal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM proposal_versions pv
      JOIN proposals p ON p.id = pv.proposal_id
      WHERE pv.id = proposal_version_id
      AND (is_admin_or_gm() OR p.created_by = auth.uid())
    )
  );

-- ============================================================================
-- TEMPLATES (read by all, managed by admin)
-- ============================================================================
CREATE POLICY pt_select ON proposal_templates FOR SELECT USING (true);
CREATE POLICY pt_manage ON proposal_templates FOR ALL USING (is_admin_or_gm());

CREATE POLICY pti_select ON proposal_template_items FOR SELECT USING (true);
CREATE POLICY pti_manage ON proposal_template_items FOR ALL USING (is_admin_or_gm());

CREATE POLICY ptt_select ON payment_term_templates FOR SELECT USING (true);
CREATE POLICY ptt_manage ON payment_term_templates FOR ALL USING (is_admin_or_gm());

-- ============================================================================
-- APPROVALS
-- ============================================================================
CREATE POLICY approvals_select ON approvals FOR SELECT
  USING (
    is_admin_or_gm()
    OR requester_id = auth.uid()
    OR approver_id = auth.uid()
  );

CREATE POLICY approvals_insert ON approvals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY approvals_update ON approvals FOR UPDATE
  USING (is_admin_or_gm());

-- ============================================================================
-- FILES (follow entity access)
-- ============================================================================
CREATE POLICY files_select ON files FOR SELECT
  USING (
    is_admin_or_gm()
    OR uploaded_by = auth.uid()
    OR (entity_type = 'client' AND EXISTS (
      SELECT 1 FROM clients c WHERE c.id = entity_id
      AND (c.account_owner_id = auth.uid() OR c.created_by = auth.uid())
    ))
    OR (entity_type = 'deal' AND EXISTS (
      SELECT 1 FROM deals d WHERE d.id = entity_id AND d.sales_owner_id = auth.uid()
    ))
  );

CREATE POLICY files_insert ON files FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- NOTIFICATIONS (own only)
-- ============================================================================
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications FOR INSERT
  WITH CHECK (true); -- System inserts

CREATE POLICY notif_prefs_select ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notif_prefs_manage ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- TARGETS
-- ============================================================================
CREATE POLICY targets_select ON targets FOR SELECT
  USING (
    is_admin_or_gm()
    OR user_id = auth.uid()
  );

CREATE POLICY targets_manage ON targets FOR ALL
  USING (is_admin_or_gm());

-- ============================================================================
-- COMMISSION
-- ============================================================================
CREATE POLICY commission_rules_select ON commission_rules FOR SELECT
  USING (is_admin_or_gm());

CREATE POLICY commission_rules_manage ON commission_rules FOR ALL
  USING (is_admin_or_gm());

CREATE POLICY commission_entries_select ON commission_entries FOR SELECT
  USING (
    is_admin_or_gm()
    OR user_id = auth.uid()
  );

CREATE POLICY commission_entries_manage ON commission_entries FOR ALL
  USING (is_admin_or_gm());

-- ============================================================================
-- ADMIN-ONLY TABLES
-- ============================================================================
-- Number Sequences
CREATE POLICY number_sequences_select ON number_sequences FOR SELECT USING (true);
CREATE POLICY number_sequences_manage ON number_sequences FOR ALL USING (is_admin_or_gm());

-- Settings
CREATE POLICY settings_select ON settings FOR SELECT USING (true);
CREATE POLICY settings_manage ON settings FOR ALL USING (is_admin_or_gm());

-- Feature Flags
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT USING (true);
CREATE POLICY feature_flags_manage ON feature_flags FOR ALL USING (is_admin_or_gm());

-- Audit Logs (read by admin only, insert by system)
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (is_admin_or_gm());

CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (true); -- System inserts via triggers/functions

-- Finance Handoffs
CREATE POLICY finance_handoffs_select ON finance_handoffs FOR SELECT
  USING (
    is_admin_or_gm()
    OR salesperson_id = auth.uid()
  );

CREATE POLICY finance_handoffs_insert ON finance_handoffs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY finance_handoffs_update ON finance_handoffs FOR UPDATE
  USING (is_admin_or_gm());

-- Integration Events (admin only)
CREATE POLICY integration_events_select ON integration_events FOR SELECT
  USING (is_admin_or_gm());

CREATE POLICY integration_events_manage ON integration_events FOR ALL
  USING (is_admin_or_gm());
