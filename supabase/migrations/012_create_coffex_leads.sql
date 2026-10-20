-- ============================================================================
-- Migration 012: Coffex Onsite Sales Leads
-- Specialized Field Lead Capture for Coffee Shops, Roasteries & Exhibitions
--
-- Run directly in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

CREATE TABLE IF NOT EXISTS coffex_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  brand_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL DEFAULT 'OWNER',
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  alternative_phone TEXT,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'القاهرة',
  area TEXT NOT NULL,
  address TEXT,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  gps_maps_url TEXT,
  activity_type TEXT NOT NULL DEFAULT 'SPECIALTY_CAFE',
  branches_count TEXT NOT NULL DEFAULT '1',
  current_system TEXT NOT NULL DEFAULT 'NONE',
  daily_orders_volume TEXT DEFAULT '100_300',
  interested_modules TEXT[] DEFAULT '{}',
  interest_level TEXT NOT NULL DEFAULT 'WARM',
  estimated_budget NUMERIC(15, 2) DEFAULT 0,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  notes TEXT,
  sales_rep_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE coffex_leads ENABLE ROW LEVEL SECURITY;

-- Indexes for high performance onsite querying
CREATE INDEX IF NOT EXISTS idx_coffex_leads_phone ON coffex_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_coffex_leads_brand ON coffex_leads(brand_name);
CREATE INDEX IF NOT EXISTS idx_coffex_leads_sales_rep ON coffex_leads(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_coffex_leads_interest ON coffex_leads(interest_level);
CREATE INDEX IF NOT EXISTS idx_coffex_leads_status ON coffex_leads(status);
CREATE INDEX IF NOT EXISTS idx_coffex_leads_created_at ON coffex_leads(created_at DESC);

-- Drop existing policies if re-running
DROP POLICY IF EXISTS coffex_select ON coffex_leads;
DROP POLICY IF EXISTS coffex_insert ON coffex_leads;
DROP POLICY IF EXISTS coffex_update ON coffex_leads;
DROP POLICY IF EXISTS coffex_delete ON coffex_leads;

-- RLS Policies:
-- 1. SELECT: Authenticated team members can read active leads
CREATE POLICY coffex_select ON coffex_leads FOR SELECT
  USING (auth.uid() IS NOT NULL AND archived_at IS NULL);

-- 2. INSERT: Authenticated team members can create leads
CREATE POLICY coffex_insert ON coffex_leads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. UPDATE: Authenticated users can update leads
CREATE POLICY coffex_update ON coffex_leads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 4. DELETE: GM and ADMIN can delete leads
CREATE POLICY coffex_delete ON coffex_leads FOR DELETE
  USING (is_admin_or_gm());

-- Auto update timestamp trigger
DROP TRIGGER IF EXISTS set_coffex_leads_updated_at ON coffex_leads;
CREATE TRIGGER set_coffex_leads_updated_at
  BEFORE UPDATE ON coffex_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Register sequence CFX-00001
INSERT INTO number_sequences (entity_type, prefix, current_value)
VALUES ('coffex_lead', 'CFX', 0)
ON CONFLICT (entity_type) DO NOTHING;
