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
