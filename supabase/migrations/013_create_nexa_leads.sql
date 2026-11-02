-- ============================================================================
-- Migration 013: Nexa Sales Leads
-- Specialized Field Lead Capture for Nexa E-Commerce & Retail Merchants
--
-- Run directly in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

CREATE TABLE IF NOT EXISTS nexa_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL UNIQUE,
  brand_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_role TEXT NOT NULL DEFAULT 'OWNER',
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  alternative_phone TEXT,
  email TEXT,
  store_url TEXT,
  city TEXT NOT NULL DEFAULT 'القاهرة',
  area TEXT NOT NULL,
  address TEXT,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  gps_maps_url TEXT,
  vertical_type TEXT NOT NULL DEFAULT 'FASHION_APPAREL',
  commerce_model TEXT NOT NULL DEFAULT 'OMNICHANNEL',
  current_system TEXT NOT NULL DEFAULT 'NONE_EXCEL',
  monthly_order_volume TEXT DEFAULT '100_500',
  branches_count TEXT NOT NULL DEFAULT '1',
  plan_interest TEXT NOT NULL DEFAULT 'GROWTH',
  interest_level TEXT NOT NULL DEFAULT 'WARM',
  estimated_budget NUMERIC(15, 2) DEFAULT 0,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  notes TEXT,
  sales_rep_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sales_rep_name TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE nexa_leads ENABLE ROW LEVEL SECURITY;

-- Indexes for high performance onsite querying
CREATE INDEX IF NOT EXISTS idx_nexa_leads_phone ON nexa_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_brand ON nexa_leads(brand_name);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_sales_rep ON nexa_leads(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_interest ON nexa_leads(interest_level);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_status ON nexa_leads(status);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_vertical ON nexa_leads(vertical_type);
CREATE INDEX IF NOT EXISTS idx_nexa_leads_commerce_model ON nexa_leads(commerce_model);

-- RLS Policies
DROP POLICY IF EXISTS "nexa_leads_select_authenticated" ON nexa_leads;
CREATE POLICY "nexa_leads_select_authenticated" ON nexa_leads
  FOR SELECT
  TO authenticated
  USING (archived_at IS NULL);

DROP POLICY IF EXISTS "nexa_leads_insert_authenticated" ON nexa_leads;
CREATE POLICY "nexa_leads_insert_authenticated" ON nexa_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "nexa_leads_update_authenticated" ON nexa_leads;
CREATE POLICY "nexa_leads_update_authenticated" ON nexa_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "nexa_leads_delete_authenticated" ON nexa_leads;
CREATE POLICY "nexa_leads_delete_authenticated" ON nexa_leads
  FOR DELETE
  TO authenticated
  USING (true);
