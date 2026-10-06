-- ============================================================================
-- Nile Nexus Sales — Initial Confirmed Users & Sample Business Data
-- Run this in Supabase SQL Editor to enable direct email/password login
-- ============================================================================

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Initial Confirmed Auth Users
-- GM: gm@nilenexus.com / password123
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'gm@nilenexus.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"أحمد الشناوي (المدير العام)","role":"GM"}',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- ADMIN: admin@nilenexus.com / password123
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'admin@nilenexus.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"سارة خليل (مديرة العمليات)","role":"ADMIN"}',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- SALES: sales@nilenexus.com / password123
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'sales@nilenexus.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"كريم فهمي (مسؤول مبيعات)","role":"SALES"}',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- 3. Ensure profiles are up to date with correct roles
INSERT INTO profiles (id, email, full_name, employee_id, role, preferred_locale, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'gm@nilenexus.com', 'أحمد الشناوي (المدير العام)', 'EMP-001', 'GM', 'ar', true),
  ('00000000-0000-0000-0000-000000000002', 'admin@nilenexus.com', 'سارة خليل (مديرة العمليات)', 'EMP-002', 'ADMIN', 'ar', true),
  ('00000000-0000-0000-0000-000000000003', 'sales@nilenexus.com', 'كريم فهمي (مسؤول مبيعات)', 'EMP-003', 'SALES', 'ar', true)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 4. Sample Potential Clients
INSERT INTO potential_clients (id, business_id, name, area, phone, phone_normalized, website, industry, status, priority, research_owner_id, created_by)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'PC-00001', 'مجموعة الأهرام للتجارة الحديثة', 'القاهرة - مصر الجديدة', '+201012345678', '201012345678', 'https://ahram-group.eg', 'التجارة والتوزيع', 'QUALIFIED', 'HIGH', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'PC-00002', 'النيل للصناعات الغذائية والتعبئة', 'الجيزة - 6 أكتوبر', '+201123456789', '201123456789', 'https://nile-foods.com', 'الصناعات الغذائية', 'CONTACTED', 'URGENT', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (business_id) DO NOTHING;

-- 5. Sample Clients
INSERT INTO clients (id, business_id, name, type, area, phone, phone_normalized, email, account_owner_id, created_by)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'CLIENT-00001', 'شركة دلتا للتوزيع اللوجستي', 'COMPANY', 'الإسكندرية', '+201234567890', '201234567890', 'info@delta-logistics.eg', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'CLIENT-00002', 'مستشفيات الصفوة التخصصية', 'COMPANY', 'القاهرة - المعادي', '+201098765432', '201098765432', 'contact@alsafwa-med.com', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (business_id) DO NOTHING;

-- 6. Sample Deals
INSERT INTO deals (id, business_id, client_id, title, stage, estimated_value, currency, probability, sales_owner_id, created_by)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'DEAL-00001', '20000000-0000-0000-0000-000000000001', 'نظام إدارة المستودعات والأسطول', 'NEGOTIATION', 350000.00, 'EGP', 75, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'DEAL-00002', '20000000-0000-0000-0000-000000000002', 'البوابة الرقمية لحجز المواعيد الطبية', 'PROPOSAL_SENT', 180000.00, 'EGP', 60, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (business_id) DO NOTHING;
