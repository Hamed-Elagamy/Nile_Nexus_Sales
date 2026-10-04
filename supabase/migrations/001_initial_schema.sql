-- ============================================================================
-- Nile Nexus Sales — Initial Database Schema
-- Migration: 001_initial_schema
-- Description: Core tables for the sales management platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- PROFILES (linked to auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  employee_id TEXT UNIQUE, -- Business identifier (e.g., "EMP-001")
  role TEXT NOT NULL DEFAULT 'SALES' CHECK (role IN ('GM', 'ADMIN', 'SALES')),
  phone TEXT,
  avatar_url TEXT,
  preferred_locale TEXT NOT NULL DEFAULT 'ar' CHECK (preferred_locale IN ('ar', 'en')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- e.g., "client.view_own", "deal.create"
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., "clients", "deals", "proposals"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('GM', 'ADMIN', 'SALES')),
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, permission_id)
);

-- ============================================================================
-- LEAD SOURCES
-- ============================================================================
CREATE TABLE lead_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- LOST REASONS
-- ============================================================================
CREATE TABLE lost_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TAGS
-- ============================================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SERVICES CATALOG
-- ============================================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  internal_reference_price DECIMAL(15,2),
  currency TEXT NOT NULL DEFAULT 'EGP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PIPELINE STAGES (configurable)
-- ============================================================================
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- Internal code: NEW, CONTACTED, etc.
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_terminal BOOLEAN NOT NULL DEFAULT false, -- WON, LOST are terminal
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- POTENTIAL CLIENTS (Research Pool)
-- ============================================================================
CREATE TABLE potential_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  area TEXT,
  phone TEXT,
  phone_normalized TEXT, -- For duplicate detection
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  source_id UUID REFERENCES lead_sources(id),
  research_owner_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'RESEARCHING', 'RESEARCHED', 'CONVERTED', 'ARCHIVED')),
  notes TEXT,
  converted_client_id UUID, -- Set when converted
  archived_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunity indicators for potential clients
CREATE TABLE potential_client_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  potential_client_id UUID NOT NULL REFERENCES potential_clients(id) ON DELETE CASCADE,
  indicator TEXT NOT NULL CHECK (indicator IN ('WEBSITE', 'ECOMMERCE', 'SOCIAL_MEDIA', 'BRANDING', 'ERP_SYSTEM', 'MARKETING', 'MOBILE_APP', 'OTHER')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (potential_client_id, indicator)
);

-- ============================================================================
-- CLIENTS
-- ============================================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'COMPANY' CHECK (type IN ('COMPANY', 'INDIVIDUAL')),
  area TEXT,
  industry TEXT,
  website TEXT,
  phone TEXT,
  phone_normalized TEXT, -- For duplicate detection
  email TEXT,
  email_normalized TEXT, -- Lowercased for duplicate detection
  address TEXT,
  source_id UUID REFERENCES lead_sources(id),
  account_owner_id UUID REFERENCES profiles(id),
  notes TEXT,
  archived_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CONTACTS (per client)
-- ============================================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_title TEXT,
  phone TEXT,
  phone_normalized TEXT,
  whatsapp TEXT,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CLIENT TAGS
-- ============================================================================
CREATE TABLE client_tags (
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, tag_id)
);

-- ============================================================================
-- DEALS
-- ============================================================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  sales_owner_id UUID NOT NULL REFERENCES profiles(id),
  stage TEXT NOT NULL DEFAULT 'NEW' CHECK (stage IN ('NEW', 'CONTACTED', 'INTERESTED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'LATER')),
  estimated_value DECIMAL(15,2),
  currency TEXT NOT NULL DEFAULT 'EGP',
  final_value DECIMAL(15,2),
  lost_reason_id UUID REFERENCES lost_reasons(id),
  lost_notes TEXT,
  resurface_date DATE,
  won_date DATE,
  notes TEXT,
  archived_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal-service association
CREATE TABLE deal_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (deal_id, service_id)
);

-- Deal tags
CREATE TABLE deal_tags (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (deal_id, tag_id)
);

-- ============================================================================
-- ACTIVITIES / TIMELINE
-- ============================================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'VISIT', 'NOTE', 'PROPOSAL', 'STAGE_CHANGE', 'FOLLOW_UP', 'SYSTEM')),
  actor_id UUID NOT NULL REFERENCES profiles(id),
  client_id UUID REFERENCES clients(id),
  deal_id UUID REFERENCES deals(id),
  summary TEXT NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FOLLOW-UPS
-- ============================================================================
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  deal_id UUID REFERENCES deals(id),
  responsible_id UUID NOT NULL REFERENCES profiles(id),
  due_at TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
  completion_result TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  deal_id UUID REFERENCES deals(id),
  assignee_id UUID NOT NULL REFERENCES profiles(id),
  deadline TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANT', 'URGENT')),
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- MEETINGS
-- ============================================================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  deal_id UUID REFERENCES deals(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meeting_participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  PRIMARY KEY (meeting_id, profile_id)
);

-- ============================================================================
-- PROPOSALS
-- ============================================================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id),
  deal_id UUID NOT NULL REFERENCES deals(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposal_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'READY', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'SUPERSEDED')),
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2),
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  valid_until DATE,
  delivery_duration TEXT,
  payment_terms TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  prepared_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, version_number)
);

CREATE TABLE proposal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_version_id UUID NOT NULL REFERENCES proposal_versions(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  description_ar TEXT NOT NULL,
  description_en TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PROPOSAL TEMPLATES
-- ============================================================================
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  payment_terms TEXT,
  terms_and_conditions TEXT,
  delivery_duration TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposal_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES proposal_templates(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  description_ar TEXT NOT NULL,
  description_en TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PAYMENT TERM TEMPLATES
-- ============================================================================
CREATE TABLE payment_term_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  terms_json JSONB NOT NULL DEFAULT '[]', -- Array of { percentage, description_ar, description_en }
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- APPROVALS
-- ============================================================================
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('DISCOUNT', 'PROPOSAL', 'OTHER')),
  entity_type TEXT NOT NULL, -- 'proposal_version', etc.
  entity_id UUID NOT NULL,
  requester_id UUID NOT NULL REFERENCES profiles(id),
  approver_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  reason TEXT,
  decision_notes TEXT,
  metadata JSONB,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FILES
-- ============================================================================
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  entity_type TEXT NOT NULL, -- 'client', 'deal', 'proposal', 'activity'
  entity_id UUID NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'UPDATE' CHECK (category IN ('ACTION_REQUIRED', 'UPDATE')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'follow_up_due', 'deal_assigned'
  in_app BOOLEAN NOT NULL DEFAULT true,
  email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type)
);

-- ============================================================================
-- TARGETS
-- ============================================================================
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  period_type TEXT NOT NULL CHECK (period_type IN ('MONTHLY', 'QUARTERLY')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metric TEXT NOT NULL, -- 'deal_count', 'won_value'
  target_value DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'EGP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMMISSION (feature-flagged OFF by default)
-- ============================================================================
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
  value DECIMAL(15,4) NOT NULL,
  service_id UUID REFERENCES services(id), -- NULL = applies to all
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE commission_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rule_id UUID REFERENCES commission_rules(id),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  status TEXT NOT NULL DEFAULT 'ESTIMATED' CHECK (status IN ('ESTIMATED', 'CONFIRMED', 'PAID')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- NUMBER SEQUENCES (concurrency-safe business ID generation)
-- ============================================================================
CREATE TABLE number_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL UNIQUE, -- 'potential_client', 'client', 'deal', 'proposal', 'task'
  prefix TEXT NOT NULL,
  separator TEXT NOT NULL DEFAULT '-',
  padding INTEGER NOT NULL DEFAULT 5,
  current_value BIGINT NOT NULL DEFAULT 0,
  year_token BOOLEAN NOT NULL DEFAULT false,
  month_token BOOLEAN NOT NULL DEFAULT false,
  reset_yearly BOOLEAN NOT NULL DEFAULT false,
  last_reset_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SETTINGS
-- ============================================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'company', 'sales', 'proposals', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'deal.value_changed', 'client.transferred', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FINANCE HANDOFFS
-- ============================================================================
CREATE TABLE finance_handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  deal_id UUID NOT NULL REFERENCES deals(id),
  final_value DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  accepted_proposal_id UUID REFERENCES proposals(id),
  accepted_version_id UUID REFERENCES proposal_versions(id),
  agreement_date DATE NOT NULL,
  salesperson_id UUID NOT NULL REFERENCES profiles(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READY', 'SENT', 'ACKNOWLEDGED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INTEGRATION OUTBOX (for future integrations)
-- ============================================================================
CREATE TABLE integration_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'client.created', 'deal.won', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Potential Clients
CREATE INDEX idx_potential_clients_status ON potential_clients(status);
CREATE INDEX idx_potential_clients_owner ON potential_clients(research_owner_id);
CREATE INDEX idx_potential_clients_phone ON potential_clients(phone_normalized);
CREATE INDEX idx_potential_clients_name_trgm ON potential_clients USING gin(name gin_trgm_ops);

-- Clients
CREATE INDEX idx_clients_owner ON clients(account_owner_id);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_archived ON clients(archived_at);
CREATE INDEX idx_clients_phone ON clients(phone_normalized);
CREATE INDEX idx_clients_email ON clients(email_normalized);
CREATE INDEX idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Contacts
CREATE INDEX idx_contacts_client ON contacts(client_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_normalized);

-- Deals
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_owner ON deals(sales_owner_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_created_at ON deals(created_at);
CREATE INDEX idx_deals_resurface ON deals(resurface_date) WHERE resurface_date IS NOT NULL;
CREATE INDEX idx_deals_won_date ON deals(won_date) WHERE won_date IS NOT NULL;

-- Activities
CREATE INDEX idx_activities_client ON activities(client_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_actor ON activities(actor_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_type ON activities(type);

-- Follow-ups
CREATE INDEX idx_follow_ups_responsible ON follow_ups(responsible_id);
CREATE INDEX idx_follow_ups_client ON follow_ups(client_id);
CREATE INDEX idx_follow_ups_due ON follow_ups(due_at);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_pending_due ON follow_ups(due_at) WHERE status = 'PENDING';

-- Tasks
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- Meetings
CREATE INDEX idx_meetings_start ON meetings(start_at);
CREATE INDEX idx_meetings_client ON meetings(client_id);

-- Proposals
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_deal ON proposals(deal_id);
CREATE INDEX idx_proposal_versions_proposal ON proposal_versions(proposal_id);
CREATE INDEX idx_proposal_versions_status ON proposal_versions(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- Audit
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Integration Events
CREATE INDEX idx_integration_events_status ON integration_events(status) WHERE status IN ('PENDING', 'PROCESSING');

-- Files
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON potential_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON finance_handoffs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON commission_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON number_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payment_term_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Concurrency-safe business ID generation
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_business_id(p_entity_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq number_sequences%ROWTYPE;
  v_new_val BIGINT;
  v_current_year INTEGER;
  v_result TEXT;
BEGIN
  -- Lock the row for this entity type
  SELECT * INTO v_seq
  FROM number_sequences
  WHERE entity_type = p_entity_type
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No sequence configured for entity type: %', p_entity_type;
  END IF;

  v_current_year := EXTRACT(YEAR FROM now());

  -- Handle yearly reset
  IF v_seq.reset_yearly AND (v_seq.last_reset_year IS NULL OR v_seq.last_reset_year < v_current_year) THEN
    v_new_val := 1;
    UPDATE number_sequences
    SET current_value = v_new_val,
        last_reset_year = v_current_year
    WHERE id = v_seq.id;
  ELSE
    v_new_val := v_seq.current_value + 1;
    UPDATE number_sequences
    SET current_value = v_new_val
    WHERE id = v_seq.id;
  END IF;

  -- Build the business ID
  v_result := v_seq.prefix;

  IF v_seq.year_token THEN
    v_result := v_result || v_seq.separator || v_current_year::TEXT;
  END IF;

  IF v_seq.month_token THEN
    v_result := v_result || v_seq.separator || LPAD(EXTRACT(MONTH FROM now())::TEXT, 2, '0');
  END IF;

  v_result := v_result || v_seq.separator || LPAD(v_new_val::TEXT, v_seq.padding, '0');

  RETURN v_result;
END;
$$;

-- Phone normalization function
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF phone IS NULL THEN RETURN NULL; END IF;
  -- Remove all non-digit characters
  RETURN regexp_replace(phone, '[^0-9+]', '', 'g');
END;
$$;

-- Auto-normalize phone on potential_clients
CREATE OR REPLACE FUNCTION normalize_potential_client_phone()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone_normalized := normalize_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_pc_phone
BEFORE INSERT OR UPDATE OF phone ON potential_clients
FOR EACH ROW EXECUTE FUNCTION normalize_potential_client_phone();

-- Auto-normalize phone/email on clients
CREATE OR REPLACE FUNCTION normalize_client_contact()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone_normalized := normalize_phone(NEW.phone);
  NEW.email_normalized := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_client_contact
BEFORE INSERT OR UPDATE OF phone, email ON clients
FOR EACH ROW EXECUTE FUNCTION normalize_client_contact();

-- Auto-normalize phone on contacts
CREATE OR REPLACE FUNCTION normalize_contact_phone()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone_normalized := normalize_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_contact_phone
BEFORE INSERT OR UPDATE OF phone ON contacts
FOR EACH ROW EXECUTE FUNCTION normalize_contact_phone();

-- ============================================================================
-- Auto-create profile on auth.users insert
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'SALES')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
