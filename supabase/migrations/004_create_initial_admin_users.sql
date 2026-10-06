-- ============================================================================
-- Nile Nexus Sales — Initial Confirmed Users & Sample Business Data
-- Paste and run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zbbivheqcutwflewmtnb/sql/new
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  -- 1. General Manager (GM) User: gm@nilenexus.com / password123
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gm@nilenexus.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000001',
      'authenticated', 'authenticated',
      'gm@nilenexus.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"أحمد الشناوي (المدير العام)","role":"GM"}',
      now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        email_confirmed_at = now(),
        raw_user_meta_data = '{"full_name":"أحمد الشناوي (المدير العام)","role":"GM"}'
    WHERE email = 'gm@nilenexus.com';
  END IF;

  -- 2. Administrator (ADMIN) User: admin@nilenexus.com / password123
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@nilenexus.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000002',
      'authenticated', 'authenticated',
      'admin@nilenexus.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"سارة خليل (مديرة العمليات)","role":"ADMIN"}',
      now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        email_confirmed_at = now(),
        raw_user_meta_data = '{"full_name":"سارة خليل (مديرة العمليات)","role":"ADMIN"}'
    WHERE email = 'admin@nilenexus.com';
  END IF;

  -- 3. Sales Representative (SALES) User: sales@nilenexus.com / password123
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sales@nilenexus.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000003',
      'authenticated', 'authenticated',
      'sales@nilenexus.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"كريم فهمي (مسؤول مبيعات)","role":"SALES"}',
      now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        email_confirmed_at = now(),
        raw_user_meta_data = '{"full_name":"كريم فهمي (مسؤول مبيعات)","role":"SALES"}'
    WHERE email = 'sales@nilenexus.com';
  END IF;

  -- 4. Auto-confirm any pending unconfirmed users
  UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
END $$;

-- 5. Sync Profiles Table with User Metadata
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  COALESCE(raw_user_meta_data->>'role', 'SALES'), 
  true
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 6. Sample Potential Clients (if none exist)
INSERT INTO potential_clients (id, business_id, name, area, phone, phone_normalized, website, industry, status, priority, research_owner_id, created_by)
SELECT 
  '10000000-0000-0000-0000-000000000001', 'PC-00001', 'مجموعة الأهرام للتجارة الحديثة', 'القاهرة - مصر الجديدة', '+201012345678', '201012345678', 'https://ahram-group.eg', 'التجارة والتوزيع', 'QUALIFIED', 'HIGH', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM potential_clients WHERE business_id = 'PC-00001');

INSERT INTO potential_clients (id, business_id, name, area, phone, phone_normalized, website, industry, status, priority, research_owner_id, created_by)
SELECT 
  '10000000-0000-0000-0000-000000000002', 'PC-00002', 'النيل للصناعات الغذائية والتعبئة', 'الجيزة - 6 أكتوبر', '+201123456789', '201123456789', 'https://nile-foods.com', 'الصناعات الغذائية', 'CONTACTED', 'URGENT', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM potential_clients WHERE business_id = 'PC-00002');

-- 7. Sample Clients (if none exist)
INSERT INTO clients (id, business_id, name, type, area, phone, phone_normalized, email, account_owner_id, created_by)
SELECT 
  '20000000-0000-0000-0000-000000000001', 'CLIENT-00001', 'شركة دلتا للتوزيع اللوجستي', 'COMPANY', 'الإسكندرية', '+201234567890', '201234567890', 'info@delta-logistics.eg', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE business_id = 'CLIENT-00001');

INSERT INTO clients (id, business_id, name, type, area, phone, phone_normalized, email, account_owner_id, created_by)
SELECT 
  '20000000-0000-0000-0000-000000000002', 'CLIENT-00002', 'مستشفيات الصفوة التخصصية', 'COMPANY', 'القاهرة - المعادي', '+201098765432', '201098765432', 'contact@alsafwa-med.com', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE business_id = 'CLIENT-00002');

-- 8. Sample Deals (if none exist)
INSERT INTO deals (id, business_id, client_id, title, stage, estimated_value, currency, probability, sales_owner_id, created_by)
SELECT 
  '30000000-0000-0000-0000-000000000001', 'DEAL-00001', '20000000-0000-0000-0000-000000000001', 'نظام إدارة المستودعات والأسطول', 'NEGOTIATION', 350000.00, 'EGP', 75, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE business_id = 'DEAL-00001');

INSERT INTO deals (id, business_id, client_id, title, stage, estimated_value, currency, probability, sales_owner_id, created_by)
SELECT 
  '30000000-0000-0000-0000-000000000002', 'DEAL-00002', '20000000-0000-0000-0000-000000000002', 'البوابة الرقمية لحجز المواعيد الطبية', 'PROPOSAL_SENT', 180000.00, 'EGP', 60, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE business_id = 'DEAL-00002');
