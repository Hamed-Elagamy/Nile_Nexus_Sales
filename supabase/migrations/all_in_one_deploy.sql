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
-- ============================================================================
-- Nile Nexus Sales — Seed / Reference Data
-- Migration: 003_seed_data
-- Description: Default reference data for pipeline stages, services, etc.
-- NOTE: This is safe for production — contains only configuration defaults.
-- ============================================================================

-- ============================================================================
-- NUMBER SEQUENCES
-- ============================================================================
INSERT INTO number_sequences (entity_type, prefix, separator, padding) VALUES
  ('potential_client', 'PC', '-', 5),
  ('client', 'CLIENT', '-', 5),
  ('deal', 'DEAL', '-', 5),
  ('proposal', 'NN-Q', '-', 5),
  ('task', 'TASK', '-', 5);

-- ============================================================================
-- PIPELINE STAGES
-- ============================================================================
INSERT INTO pipeline_stages (code, name_ar, name_en, color, sort_order, is_terminal) VALUES
  ('NEW', 'جديدة', 'New', '#6366f1', 1, false),
  ('CONTACTED', 'تم التواصل', 'Contacted', '#3b82f6', 2, false),
  ('INTERESTED', 'مهتم 👀', 'Interested 👀', '#f59e0b', 3, false),
  ('PROPOSAL_SENT', 'تم إرسال العرض 📄', 'Proposal Sent 📄', '#8b5cf6', 4, false),
  ('NEGOTIATION', 'مفاوضة 🤝', 'Negotiation 🤝', '#ec4899', 5, false),
  ('WON', 'مكسبنا 🎉', 'Won 🎉', '#22c55e', 6, true),
  ('LOST', 'خسرناها', 'Lost', '#ef4444', 7, true),
  ('LATER', 'بعدين 💤', 'Later 💤', '#94a3b8', 8, false);

-- ============================================================================
-- LEAD SOURCES
-- ============================================================================
INSERT INTO lead_sources (name_ar, name_en, sort_order) VALUES
  ('إحالة', 'Referral', 1),
  ('موقع إلكتروني', 'Website', 2),
  ('سوشيال ميديا', 'Social Media', 3),
  ('معرض', 'Exhibition', 4),
  ('اتصال مباشر', 'Cold Call', 5),
  ('إيميل', 'Email', 6),
  ('شريك', 'Partner', 7),
  ('عميل سابق', 'Existing Client', 8),
  ('أخرى', 'Other', 9);

-- ============================================================================
-- LOST REASONS
-- ============================================================================
INSERT INTO lost_reasons (code, name_ar, name_en, sort_order) VALUES
  ('PRICE', 'السعر', 'Price', 1),
  ('COMPETITOR', 'منافس', 'Competitor', 2),
  ('NOT_READY', 'مش جاهز', 'Not Ready', 3),
  ('NO_RESPONSE', 'مفيش رد', 'No Response', 4),
  ('SERVICE_NOT_SUITABLE', 'الخدمة مش مناسبة', 'Service Not Suitable', 5),
  ('POSTPONED', 'تأجيل', 'Postponed', 6),
  ('OTHER', 'سبب تاني', 'Other', 7);

-- ============================================================================
-- SERVICES
-- ============================================================================
INSERT INTO services (name_ar, name_en, sort_order) VALUES
  ('تطوير مواقع', 'Website Development', 1),
  ('تجارة إلكترونية', 'E-commerce', 2),
  ('تطبيق موبايل', 'Mobile Application', 3),
  ('نظام ERP', 'ERP System', 4),
  ('نظام نقاط البيع', 'POS System', 5),
  ('برمجيات مخصصة', 'Custom Software', 6),
  ('SaaS', 'SaaS', 7),
  ('تكامل أنظمة', 'System Integration', 8),
  ('حلول سحابية', 'Cloud Solutions', 9),
  ('تصميم UI/UX', 'UI/UX Design', 10),
  ('صيانة ودعم فني', 'Maintenance & Support', 11);

-- ============================================================================
-- DEFAULT SETTINGS
-- ============================================================================
INSERT INTO settings (key, value, category) VALUES
  ('company.name', '"Nile Nexus"', 'company'),
  ('company.currency', '"EGP"', 'company'),
  ('company.timezone', '"Africa/Cairo"', 'company'),
  ('company.locale', '"ar"', 'company'),
  ('sales.discount_threshold', '10', 'sales'),
  ('sales.stale_lead_days', '7', 'sales'),
  ('sales.stale_interested_days', '14', 'sales'),
  ('sales.stale_negotiation_days', '21', 'sales'),
  ('proposals.follow_up_days', '3', 'proposals'),
  ('proposals.expiration_warning_days', '3', 'proposals'),
  ('proposals.default_validity_days', '30', 'proposals');

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================
INSERT INTO feature_flags (code, name, description, is_enabled) VALUES
  ('commission', 'Commission Module', 'Enable commission tracking and calculations', false),
  ('targets', 'Sales Targets', 'Enable target setting and tracking', true),
  ('approval_workflow', 'Approval Workflow', 'Enable discount and proposal approval workflow', true),
  ('calendar_integrations', 'Calendar Integrations', 'Enable Google Calendar / Outlook integration', false),
  ('whatsapp_integration', 'WhatsApp Integration', 'Enable WhatsApp Business integration', false),
  ('email_integration', 'Email Integration', 'Enable email send/receive integration', false),
  ('finance_handoff', 'Finance Handoff', 'Enable finance handoff workflow', true),
  ('excel_import', 'Excel Import', 'Enable Excel data import wizard', true);

-- ============================================================================
-- DEFAULT PERMISSIONS
-- ============================================================================
INSERT INTO permissions (code, name_ar, name_en, category) VALUES
  -- Clients
  ('client.view_own', 'عرض العملاء الخاصة', 'View Own Clients', 'clients'),
  ('client.view_all', 'عرض كل العملاء', 'View All Clients', 'clients'),
  ('client.create', 'إنشاء عميل', 'Create Client', 'clients'),
  ('client.update', 'تعديل عميل', 'Update Client', 'clients'),
  -- Deals
  ('deal.view_own', 'عرض الصفقات الخاصة', 'View Own Deals', 'deals'),
  ('deal.view_all', 'عرض كل الصفقات', 'View All Deals', 'deals'),
  ('deal.create', 'إنشاء صفقة', 'Create Deal', 'deals'),
  ('deal.update', 'تعديل صفقة', 'Update Deal', 'deals'),
  ('deal.transfer', 'نقل صفقة', 'Transfer Deal', 'deals'),
  -- Proposals
  ('proposal.create', 'إنشاء عرض', 'Create Proposal', 'proposals'),
  ('proposal.send', 'إرسال عرض', 'Send Proposal', 'proposals'),
  -- Discounts
  ('discount.request', 'طلب خصم', 'Request Discount', 'discounts'),
  ('discount.approve', 'الموافقة على خصم', 'Approve Discount', 'discounts'),
  -- Reports
  ('reports.view_own', 'عرض التقارير الخاصة', 'View Own Reports', 'reports'),
  ('reports.view_company', 'عرض تقارير الشركة', 'View Company Reports', 'reports'),
  -- Admin
  ('users.manage', 'إدارة المستخدمين', 'Manage Users', 'admin'),
  ('settings.manage', 'إدارة الإعدادات', 'Manage Settings', 'admin'),
  ('audit.view', 'عرض سجل التدقيق', 'View Audit Log', 'admin');

-- Assign all permissions to GM and ADMIN
INSERT INTO role_permissions (role, permission_id)
SELECT 'GM', id FROM permissions;

INSERT INTO role_permissions (role, permission_id)
SELECT 'ADMIN', id FROM permissions;

-- Assign limited permissions to SALES
INSERT INTO role_permissions (role, permission_id)
SELECT 'SALES', id FROM permissions
WHERE code IN (
  'client.view_own', 'client.create', 'client.update',
  'deal.view_own', 'deal.create', 'deal.update',
  'proposal.create', 'proposal.send',
  'discount.request',
  'reports.view_own'
);

-- ============================================================================
-- DEFAULT PAYMENT TERM TEMPLATE
-- ============================================================================
INSERT INTO payment_term_templates (name_ar, name_en, terms_json) VALUES
  ('معياري 50/30/20', 'Standard 50/30/20', '[
    {"percentage": 50, "description_ar": "عند بداية المشروع", "description_en": "Upon project start"},
    {"percentage": 30, "description_ar": "عند الموافقة المبدئية", "description_en": "Upon initial approval"},
    {"percentage": 20, "description_ar": "عند التسليم النهائي", "description_en": "Upon final delivery"}
  ]'),
  ('نصف ونصف', 'Half and Half', '[
    {"percentage": 50, "description_ar": "عند بداية المشروع", "description_en": "Upon project start"},
    {"percentage": 50, "description_ar": "عند التسليم النهائي", "description_en": "Upon final delivery"}
  ]'),
  ('كامل مقدم', 'Full Upfront', '[
    {"percentage": 100, "description_ar": "عند بداية المشروع", "description_en": "Upon project start"}
  ]');
