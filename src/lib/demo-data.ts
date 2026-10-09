import type {
  Client,
  Contact,
  Deal,
  FollowUp,
  PotentialClient,
  Profile,
  Service,
  Task,
} from "@/types/domain";

// ─── Demo Profiles ───────────────────────────────────────────
export const demoProfiles: Profile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "gm@nilenexus.com",
    full_name: "أحمد الشناوي",
    employee_id: "EMP-001",
    role: "GM",
    phone: "+201001234567",
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "admin@nilenexus.com",
    full_name: "سارة عبد الرحمن",
    employee_id: "EMP-002",
    role: "ADMIN",
    phone: "+201009876543",
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "sales@nilenexus.com",
    full_name: "كريم فهمي",
    employee_id: "EMP-003",
    role: "SALES",
    phone: "+201112223344",
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    email: "mostafa@nilenexus.com",
    full_name: "مصطفى كمال",
    employee_id: "EMP-004",
    role: "SALES",
    phone: "+201223334455",
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-01-15T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    email: "Hamedelagamy00@gmail.com",
    full_name: "Mohamed Hamed",
    employee_id: "EMP-005",
    role: "GM",
    phone: null,
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    email: "ezzreem726@gmail.com",
    full_name: "Reem Ezz",
    employee_id: "EMP-006",
    role: "GM",
    phone: null,
    avatar_url: null,
    preferred_locale: "ar",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
];

// ─── Demo Services Catalog ────────────────────────────────────
export const demoServices: Service[] = [
  {
    id: "srv-001",
    name_ar: "نظام إدارة المبيعات والعمليات الرقمية",
    name_en: "Nile Nexus Sales Core Suite",
    description_ar: "ميكنة كاملة لإدارة العملاء والبايبلاين وعروض الأسعار",
    description_en: "Full sales lifecycle & CRM workflow system",
    internal_reference_price: "250000.00",
    currency: "EGP",
    is_active: true,
    sort_order: 1,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "srv-002",
    name_ar: "تطوير المنصات والتطبيقات المتخصصة",
    name_en: "Custom Web & Mobile Development",
    description_ar: "تصميم وتنفيذ تطبيقات الويب والموبايل المخصصة للمؤسسات",
    description_en: "Bespoke digital platforms & enterprise apps",
    internal_reference_price: "180000.00",
    currency: "EGP",
    is_active: true,
    sort_order: 2,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "srv-003",
    name_ar: "استشارات التحول الرقمي وتكامل الأنظمة",
    name_en: "Digital Transformation & ERP Integration",
    description_ar: "ربط وتكامل الأنظمة المالية والمخازن وخدمة العملاء",
    description_en: "Integration architecture & enterprise consultation",
    internal_reference_price: "95000.00",
    currency: "EGP",
    is_active: true,
    sort_order: 3,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "srv-004",
    name_ar: "عقد الدعم الفني والصيانة السنوية (SLA)",
    name_en: "Annual SLA Maintenance & Technical Support",
    description_ar: "دعم فني وتحديثات مستمرة مدار الساعة",
    description_en: "24/7 technical support and maintenance SLA",
    internal_reference_price: "45000.00",
    currency: "EGP",
    is_active: true,
    sort_order: 4,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-01T08:00:00Z",
  },
];

// ─── Demo Lead Sources ────────────────────────────────────────
export const demoLeadSources = [
  { id: "src-01", name_ar: "إعلانات لينكد إن (LinkedIn)", name_en: "LinkedIn Ads", is_active: true, sort_order: 1 },
  { id: "src-02", name_ar: "توصية من عميل حالي (Referral)", name_en: "Client Referral", is_active: true, sort_order: 2 },
  { id: "src-03", name_ar: "معرض القاهرة الدولي للصناعة", name_en: "Cairo Industry Expo", is_active: true, sort_order: 3 },
  { id: "src-04", name_ar: "اتصال ومبيعات مباشرة (Outbound)", name_en: "Outbound Sales", is_active: true, sort_order: 4 },
  { id: "src-05", name_ar: "الموقع الإلكتروني الرسمي", name_en: "Official Website", is_active: true, sort_order: 5 },
];

// ─── Demo Potential Clients (العملاء المحتملين) ───────────────
export const demoPotentialClients: PotentialClient[] = [
  {
    id: "pc-001",
    business_id: "POT-00101",
    name: "شركة الأهرام للمقاولات والتطوير العقاري",
    area: "القاهرة الجديدة - التجمع الخامس",
    phone: "+201011223344",
    website: "https://ahram-contracting.eg",
    instagram: null,
    facebook: "https://facebook.com/ahramcontracting",
    source: "src-02",
    research_owner_id: "00000000-0000-0000-0000-000000000003",
    status: "RESEARCHED",
    notes: "مهتمون بشدة بميكنة مبيعات المشروعات العقارية وربطها مع المتابعات الهاتفية.",
    converted_client_id: null,
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-10T10:00:00Z",
    updated_at: "2026-02-12T14:30:00Z",
  },
  {
    id: "pc-002",
    business_id: "POT-00102",
    name: "مصانع الدلتا للأغذية المحفوظة",
    area: "المنطقة الصناعية - مدينة السادات",
    phone: "+201022334455",
    website: "https://deltafoods-eg.com",
    instagram: null,
    facebook: null,
    source: "src-03",
    research_owner_id: "00000000-0000-0000-0000-000000000004",
    status: "NEW",
    notes: "تمت مقابلتهم في المعرض ولديهم رغبة في استبدال جداول الإكسيل لإدارة مندوبي التوزيع.",
    converted_client_id: null,
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    created_at: "2026-02-15T09:00:00Z",
    updated_at: "2026-02-15T09:00:00Z",
  },
  {
    id: "pc-003",
    business_id: "POT-00103",
    name: "المجموعة المصرية للخدمات اللوجستية",
    area: "العاشر من رمضان",
    phone: "+201133445566",
    website: "https://egypt-logistics.com",
    instagram: null,
    facebook: null,
    source: "src-01",
    research_owner_id: "00000000-0000-0000-0000-000000000003",
    status: "RESEARCHING",
    notes: "فريق المبيعات لديهم أكثر من 20 موظف، يحتاجون بايبلاين مبيعات موحد.",
    converted_client_id: null,
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-18T11:20:00Z",
    updated_at: "2026-02-20T16:00:00Z",
  },
  {
    id: "pc-004",
    business_id: "POT-00104",
    name: "تكنو سوفت مصر للحلول الرقمية",
    area: "القرية الذكية - 6 أكتوبر",
    phone: "+201244556677",
    website: "https://technosoft-eg.com",
    instagram: null,
    facebook: null,
    source: "src-05",
    research_owner_id: "00000000-0000-0000-0000-000000000003",
    status: "RESEARCHED",
    notes: "طلبوا اجتماعاً تقنياً لمناقشة الربط البرمجي وعروض الأسعار المقترحة.",
    converted_client_id: null,
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-22T13:45:00Z",
    updated_at: "2026-02-23T10:15:00Z",
  },
];

// ─── Demo Clients (العملاء المعتمدين) ───────────────────────────
export const demoClients: Client[] = [
  {
    id: "c-001",
    business_id: "CLIENT-00201",
    name: "شركة النيل للمقاولات والتجارة",
    type: "COMPANY",
    area: "مصر الجديدة - القاهرة",
    industry: "التشييد والمقاولات",
    website: "https://nile-contracting.com",
    phone: "+20224156789",
    email: "info@nile-contracting.com",
    address: "15 شارع الثورة، مصر الجديدة، القاهرة",
    source: "src-02",
    account_owner_id: "00000000-0000-0000-0000-000000000003",
    notes: "عميل استراتيجي، تم توقيع العقد الأول بنجاح ويجري بحث التوسعات.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    updated_by: null,
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "c-002",
    business_id: "CLIENT-00202",
    name: "القاهرة للصناعات الغذائية والتعبئة",
    type: "COMPANY",
    area: "مدينة العبور - القليوبية",
    industry: "الصناعات الغذائية",
    website: "https://cairo-food.com",
    phone: "+20244891234",
    email: "contact@cairo-food.com",
    address: "المنطقة الصناعية الأولى، قطعة 4B، العبور",
    source: "src-03",
    account_owner_id: "00000000-0000-0000-0000-000000000004",
    notes: "عميل نشط، بحاجة لربط عروض الأسعار مع إدارة الحسابات.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    updated_by: null,
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-01-20T11:00:00Z",
  },
  {
    id: "c-003",
    business_id: "CLIENT-00203",
    name: "تبارك للاستثمار والتطوير العقاري",
    type: "COMPANY",
    area: "الشيخ زايد - الجيزة",
    industry: "التطوير العقاري",
    website: "https://tabarak-developments.com",
    phone: "+20238519900",
    email: "sales@tabarak-developments.com",
    address: "أركان بلازا، المبنى الإداري، الشيخ زايد",
    source: "src-01",
    account_owner_id: "00000000-0000-0000-0000-000000000003",
    notes: "في مرحلة المفاوضات النهائية على باقة الـ Enterprise.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    updated_by: null,
    created_at: "2026-02-01T10:30:00Z",
    updated_at: "2026-02-01T10:30:00Z",
  },
  {
    id: "c-004",
    business_id: "CLIENT-00204",
    name: "م. حسام الدين غانم (مستشار تقني مستقل)",
    type: "INDIVIDUAL",
    area: "المعادي - القاهرة",
    industry: "الاستشارات الفنية",
    website: null,
    phone: "+201005544332",
    email: "hossam.ghanem@consultant.eg",
    address: "شارع 9، المعادي، القاهرة",
    source: "src-04",
    account_owner_id: "00000000-0000-0000-0000-000000000004",
    notes: "استشاري لمجموعة شركات مقاولات، يطلب ترخيص استشاري.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    updated_by: null,
    created_at: "2026-02-05T14:00:00Z",
    updated_at: "2026-02-05T14:00:00Z",
  },
];

// ─── Demo Contacts ───────────────────────────────────────────
export const demoContacts: Contact[] = [
  {
    id: "cnt-001",
    client_id: "c-001",
    name: "م. طارق رضوان",
    job_title: "رئيس قطاع المشتريات والتعاقدات",
    phone: "+201019988776",
    whatsapp: "+201019988776",
    email: "tarek.radwan@nile-contracting.com",
    is_primary: true,
    notes: "صاحب القرار الفني والتعاقدي.",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "cnt-002",
    client_id: "c-002",
    name: "أ. هاني عبد السلام",
    job_title: "المدير المالي والإداري",
    phone: "+201028877665",
    whatsapp: "+201028877665",
    email: "hani.as@cairo-food.com",
    is_primary: true,
    notes: "المسؤول عن اعتماد عروض الأسعار وجداول الدفع.",
    created_at: "2026-01-20T11:00:00Z",
    updated_at: "2026-01-20T11:00:00Z",
  },
  {
    id: "cnt-003",
    client_id: "c-003",
    name: "د. مروة الشاذلي",
    job_title: "مدير قطاع التطوير التجاري",
    phone: "+201147766554",
    whatsapp: "+201147766554",
    email: "marwa.shazly@tabarak-developments.com",
    is_primary: true,
    notes: "مهتمة بمؤشرات قياس أداء فريق المبيعات اليومية.",
    created_at: "2026-02-01T10:30:00Z",
    updated_at: "2026-02-01T10:30:00Z",
  },
];

// ─── Demo Deals & Pipeline ────────────────────────────────────
export const demoDeals: Deal[] = [
  {
    id: "d-001",
    business_id: "DEAL-00301",
    title: "ميكنة إدارة المبيعات لشركة النيل للمقاولات",
    client_id: "c-001",
    sales_owner_id: "00000000-0000-0000-0000-000000000003",
    stage: "WON",
    estimated_value: "520000.00",
    currency: "EGP",
    final_value: "520000.00",
    lost_reason: null,
    lost_notes: null,
    resurface_date: null,
    won_date: "2026-02-14T12:00:00Z",
    notes: "تم توقيع العقد وتسليم النسخة المعتمدة.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    updated_by: null,
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-02-14T12:00:00Z",
  },
  {
    id: "d-002",
    business_id: "DEAL-00302",
    title: "نظام إدارة الموزعين ومندوبي القاهرة الغذائية",
    client_id: "c-002",
    sales_owner_id: "00000000-0000-0000-0000-000000000004",
    stage: "PROPOSAL_SENT",
    estimated_value: "450000.00",
    currency: "EGP",
    final_value: null,
    lost_reason: null,
    lost_notes: null,
    resurface_date: null,
    won_date: null,
    notes: "تم إرسال العرض المالي برقم PROP-00102 وجاري المتابعة.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    updated_by: null,
    created_at: "2026-01-25T11:30:00Z",
    updated_at: "2026-02-18T15:00:00Z",
  },
  {
    id: "d-003",
    business_id: "DEAL-00303",
    title: "باقة المنصة السحابية المتكاملة لشركة تبارك",
    client_id: "c-003",
    sales_owner_id: "00000000-0000-0000-0000-000000000003",
    stage: "NEGOTIATION",
    estimated_value: "650000.00",
    currency: "EGP",
    final_value: null,
    lost_reason: null,
    lost_notes: null,
    resurface_date: null,
    won_date: null,
    notes: "مناقشة شروط الدفع والخصم الإضافي مع د. مروة الشاذلي.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    updated_by: null,
    created_at: "2026-02-03T14:00:00Z",
    updated_at: "2026-02-24T16:20:00Z",
  },
  {
    id: "d-004",
    business_id: "DEAL-00304",
    title: "ترخيص استشاري وباقة التدريب التقني المتقدم",
    client_id: "c-004",
    sales_owner_id: "00000000-0000-0000-0000-000000000004",
    stage: "CONTACTED",
    estimated_value: "95000.00",
    currency: "EGP",
    final_value: null,
    lost_reason: null,
    lost_notes: null,
    resurface_date: null,
    won_date: null,
    notes: "تواصل أولي واستعراض المزايا والاشتراك التجريبي.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    updated_by: null,
    created_at: "2026-02-08T09:40:00Z",
    updated_at: "2026-02-19T11:15:00Z",
  },
  {
    id: "d-005",
    business_id: "DEAL-00305",
    title: "تطوير تطبيق البوابة العقارية لمجموعة الأهرام",
    client_id: "c-001",
    sales_owner_id: "00000000-0000-0000-0000-000000000003",
    stage: "INTERESTED",
    estimated_value: "280000.00",
    currency: "EGP",
    final_value: null,
    lost_reason: null,
    lost_notes: null,
    resurface_date: null,
    won_date: null,
    notes: "أبدوا اهتماماً كبيراً بعد عرض النموذج التجريبي.",
    archived_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    updated_by: null,
    created_at: "2026-02-12T13:00:00Z",
    updated_at: "2026-02-22T10:00:00Z",
  },
];

// ─── Demo Follow-ups (المتابعات اليومية) ────────────────────────
export const demoFollowUps: FollowUp[] = [
  {
    id: "flw-001",
    client_id: "c-001",
    deal_id: "d-001",
    responsible_id: "00000000-0000-0000-0000-000000000003",
    due_at: new Date().toISOString(), // Today
    action: "اتصال هاتفي لتأكيد موعد تسليم الدفعة الأولى وتدريب الفريق",
    notes: "الاتصال بم. طارق رضوان الساعة 2:00 ظهراً.",
    status: "PENDING",
    completion_result: null,
    completed_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
  },
  {
    id: "flw-002",
    client_id: "c-002",
    deal_id: "d-002",
    responsible_id: "00000000-0000-0000-0000-000000000004",
    due_at: new Date().toISOString(), // Today
    action: "إرسال ملحق العرض المالي المعدل والجدول الزمني عبر واتساب",
    notes: "أ. هاني طلب توضيح الجدول الزمني للتنفيذ بالمراحل.",
    status: "PENDING",
    completion_result: null,
    completed_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    created_at: "2026-02-22T12:00:00Z",
    updated_at: "2026-02-22T12:00:00Z",
  },
  {
    id: "flw-003",
    client_id: "c-003",
    deal_id: "d-003",
    responsible_id: "00000000-0000-0000-0000-000000000003",
    due_at: "2026-02-20T09:00:00Z", // Overdue!
    action: "مكالمة هاتفية لمتابعة رد مجلس إدارة تبارك بخصوص نسبة الخصم",
    notes: "متأخرة منذ يومين - بحاجة للتواصل العاجل لمنع تبريد الفرصة.",
    status: "PENDING",
    completion_result: null,
    completed_at: null,
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-18T08:30:00Z",
    updated_at: "2026-02-18T08:30:00Z",
  },
  {
    id: "flw-004",
    client_id: "c-004",
    deal_id: "d-004",
    responsible_id: "00000000-0000-0000-0000-000000000004",
    due_at: "2026-03-05T11:00:00Z", // Upcoming
    action: "اجتماع زووم تجريبي لشرح إمكانيات التقارير والتحليلات",
    notes: "رابط الاجتماع تم إرساله مسبقاً عبر البريد.",
    status: "PENDING",
    completion_result: null,
    completed_at: null,
    created_by: "00000000-0000-0000-0000-000000000004",
    created_at: "2026-02-23T15:00:00Z",
    updated_at: "2026-02-23T15:00:00Z",
  },
  {
    id: "flw-005",
    client_id: "c-001",
    deal_id: "d-001",
    responsible_id: "00000000-0000-0000-0000-000000000003",
    due_at: "2026-02-10T14:00:00Z",
    action: "جلسة العرض التقديمي المباشر في مقر الشركة",
    notes: "تم اللقاء بحضور المهندس طارق والمدير المالي وتمت الموافقة المبدئية.",
    status: "COMPLETED",
    completion_result: "تمت الموافقة بنجاح وتم طلب إعداد العقد النهائي.",
    completed_at: "2026-02-10T16:30:00Z",
    created_by: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-02-05T10:00:00Z",
    updated_at: "2026-02-10T16:30:00Z",
  },
];

// ─── Demo Proposals ───────────────────────────────────────────
export interface DemoProposalLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface DemoProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  status: string;
  subtotal: string;
  discount_amount: string;
  discount_percentage: string;
  tax_amount: string;
  grand_total: string;
  currency: string;
  terms?: string | null;
  notes?: string | null;
  approved_by?: string | null;
  sent_at?: string | null;
  valid_until?: string | null;
  delivery_duration?: string | null;
  payment_terms?: string | null;
  terms_and_conditions?: string | null;
  prepared_by?: string | null;
  created_at: string;
  line_items?: DemoProposalLineItem[];
  items?: unknown[];
  prepared_by_user?: { id: string; full_name: string; email: string };
}

export interface DemoProposal {
  id: string;
  business_id: string;
  title: string;
  client_id: string;
  deal_id: string;
  sales_owner_id: string;
  status: string;
  total_amount: string;
  currency: string;
  current_version: number;
  client: { id: string; name: string; business_id: string; phone: string | null; email: string | null };
  deal: { id: string; title: string; business_id: string; stage: "NEW" | "CONTACTED" | "INTERESTED" | "PROPOSAL_SENT" | "NEGOTIATION" | "WON" | "LOST" | "LATER"; estimated_value: string } | null;
  sales_owner: { id: string; full_name: string; email: string };
  versions: DemoProposalVersion[];
  created_at: string;
  updated_at: string;
}

export const demoProposals: DemoProposal[] = [
  {
    id: "prop-001",
    business_id: "PROP-00101",
    title: "عرض سعر ميكنة إدارة المبيعات لشركة النيل للمقاولات",
    client_id: "c-001",
    deal_id: "d-001",
    sales_owner_id: "00000000-0000-0000-0000-000000000003",
    status: "ACCEPTED",
    total_amount: "520000.00",
    currency: "EGP",
    current_version: 1,
    client: { id: "c-001", name: "شركة النيل للمقاولات والتجارة", business_id: "CLIENT-00201", phone: "+20224156789", email: "info@nile-contracting.com" },
    deal: { id: "d-001", title: "ميكنة إدارة المبيعات لشركة النيل للمقاولات", business_id: "DEAL-00301", stage: "WON" as const, estimated_value: "520000.00" },
    sales_owner: { id: "00000000-0000-0000-0000-000000000003", full_name: "كريم فهمي", email: "sales@nilenexus.com" },
    versions: [
      {
        id: "v-001",
        proposal_id: "prop-001",
        version_number: 1,
        status: "ACCEPTED",
        subtotal: "480000.00",
        discount_amount: "24000.00",
        discount_percentage: "5.00",
        tax_amount: "64000.00",
        grand_total: "520000.00",
        currency: "EGP",
        terms: "شروط الدفع: 50% دفعة مقدمة عند التوقيع، 30% بعد إتمام التركيب، 20% بعد التدريب.",
        notes: "تمت الموافقة الرسمية من رئيس قطاع المشتريات.",
        approved_by: "00000000-0000-0000-0000-000000000001",
        sent_at: "2026-02-05T12:00:00Z",
        valid_until: "2026-03-05T10:00:00Z",
        delivery_duration: "6 أسابيع",
        payment_terms: "50% مقدم، 30% توريد، 20% تشغيل",
        terms_and_conditions: null,
        prepared_by: "00000000-0000-0000-0000-000000000003",
        created_at: "2026-02-05T10:00:00Z",
        line_items: [
          {
            id: "li-01",
            title: "نظام Nile Nexus Sales Core Suite (15 مستخدم)",
            description: "شامل السيرفرات وإعداد البايبلاين وقواعد البيانات والصلاحيات",
            quantity: 1,
            unit_price: "350000.00",
            total_price: "350000.00",
          },
          {
            id: "li-02",
            title: "خدمة التدريب والتجهيز والتكامل الداخلي",
            description: "ورش عمل ميدانية لتدريب فريق المبيعات والإدارة",
            quantity: 1,
            unit_price: "130000.00",
            total_price: "130000.00",
          },
        ],
      },
    ],
    created_at: "2026-02-05T10:00:00Z",
    updated_at: "2026-02-14T12:00:00Z",
  },
  {
    id: "prop-002",
    business_id: "PROP-00102",
    title: "عرض سعر تطوير منصة التوزيع ومتابعة المبيعات الميدانية",
    client_id: "c-002",
    deal_id: "d-002",
    sales_owner_id: "00000000-0000-0000-0000-000000000004",
    status: "SENT",
    total_amount: "450000.00",
    currency: "EGP",
    current_version: 2,
    client: { id: "c-002", name: "القاهرة للصناعات الغذائية والتعبئة", business_id: "CLIENT-00202", phone: "+20244891234", email: "contact@cairo-food.com" },
    deal: { id: "d-002", title: "نظام إدارة الموزعين ومندوبي القاهرة الغذائية", business_id: "DEAL-00302", stage: "PROPOSAL_SENT" as const, estimated_value: "450000.00" },
    sales_owner: { id: "00000000-0000-0000-0000-000000000004", full_name: "مصطفى كمال", email: "mostafa@nilenexus.com" },
    versions: [
      {
        id: "v-002",
        proposal_id: "prop-002",
        version_number: 2,
        status: "SENT",
        subtotal: "420000.00",
        discount_amount: "21000.00",
        discount_percentage: "5.00",
        tax_amount: "51000.00",
        grand_total: "450000.00",
        currency: "EGP",
        terms: "صلاحية العرض: 30 يوماً من تاريخ الإرسال. يشمل سنة دعم فني مجاني.",
        notes: "الإصدار الثاني بعد تعديل نطاق الربط مع أ. هاني عبد السلام.",
        approved_by: null,
        sent_at: "2026-02-18T14:30:00Z",
        valid_until: "2026-03-18T14:00:00Z",
        delivery_duration: "8 أسابيع",
        payment_terms: "4 دفعات متساوية",
        terms_and_conditions: null,
        prepared_by: "00000000-0000-0000-0000-000000000004",
        created_at: "2026-02-18T14:00:00Z",
        line_items: [
          {
            id: "li-03",
            title: "تطبيق المبيعات الميدانية لمندوبي التوزيع (Android & Web)",
            description: "تسجيل الزيارات اليومية وتتبع الطلبيات والتحصيلات",
            quantity: 1,
            unit_price: "280000.00",
            total_price: "280000.00",
          },
          {
            id: "li-04",
            title: "لوحة تحكم المشرفين والربط مع نظام المخازن",
            description: "تقارير المبيعات الحية والأداء اليومي للموزعين",
            quantity: 1,
            unit_price: "140000.00",
            total_price: "140000.00",
          },
        ],
      },
    ],
    created_at: "2026-02-10T11:00:00Z",
    updated_at: "2026-02-18T14:00:00Z",
  },
];

// ─── Demo Tasks ───────────────────────────────────────────────
export const demoTasks: Task[] = [
  {
    id: "tsk-001",
    title: "مراجعة ملف السجل التجاري والبطاقة الضريبية لشركة النيل",
    client_id: "c-001",
    deal_id: "d-001",
    assignee_id: "00000000-0000-0000-0000-000000000002",
    deadline: "2026-02-28T16:00:00Z",
    priority: "IMPORTANT",
    status: "IN_PROGRESS",
    notes: "التنسيق مع الشؤون القانونية لصياغة الملحق التنفيذي.",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
  },
  {
    id: "tsk-002",
    title: "تجهيز وتنسيق عرض الأسعار الجديد لشركة تبارك العقارية",
    client_id: "c-003",
    deal_id: "d-003",
    assignee_id: "00000000-0000-0000-0000-000000000003",
    deadline: "2026-02-26T12:00:00Z",
    priority: "URGENT",
    status: "TODO",
    notes: "تضمين خصم الـ 5% المعتمد من المدير العام.",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-02-22T09:00:00Z",
    updated_at: "2026-02-22T09:00:00Z",
  },
  {
    id: "tsk-003",
    title: "إعداد تقرير أداء المبيعات الشهري للمدير العام",
    client_id: null,
    deal_id: null,
    assignee_id: "00000000-0000-0000-0000-000000000002",
    deadline: "2026-03-01T10:00:00Z",
    priority: "NORMAL",
    status: "TODO",
    notes: "حساب نسب التحويل وقيمة البايبلاين الإجمالية.",
    created_by: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-02-24T11:00:00Z",
    updated_at: "2026-02-24T11:00:00Z",
  },
];

// ─── Demo Approvals ───────────────────────────────────────────
export interface ApprovalRequest {
  id: string;
  type: "DISCOUNT" | "TERMS" | "CREDIT";
  title: string;
  requester_name: string;
  client_name: string;
  deal_title: string;
  amount: string;
  requested_discount: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}

export const demoApprovals: ApprovalRequest[] = [
  {
    id: "appr-01",
    type: "DISCOUNT",
    title: "طلب اعتماد خصم استثنائي 7.5% لشركة تبارك العقارية",
    requester_name: "كريم فهمي",
    client_name: "تبارك للاستثمار والتطوير العقاري",
    deal_title: "باقة المنصة السحابية المتكاملة لشركة تبارك",
    amount: "650,000 ج.م",
    requested_discount: "48,750 ج.م (7.5%)",
    reason: "العميل مستعد لتوقيع عقد مدته 3 سنوات مع دفع 60% مقدماً في حال اعتماد الخصم.",
    status: "PENDING",
    created_at: "2026-02-24T14:30:00Z",
  },
  {
    id: "appr-02",
    type: "TERMS",
    title: "تسهيلات في جدول السداد لشركة القاهرة للصناعات الغذائية",
    requester_name: "مصطفى كمال",
    client_name: "القاهرة للصناعات الغذائية والتعبئة",
    deal_title: "نظام إدارة الموزعين ومندوبي القاهرة الغذائية",
    amount: "450,000 ج.م",
    requested_discount: "بدون خصم (تقسيط على 4 دفعات)",
    reason: "موافقة على تقسيط المبلغ على 4 دفعات متساوية بدلاً من 3 لتسريع التعاقد.",
    status: "APPROVED",
    created_at: "2026-02-22T11:15:00Z",
  },
];

// ─── Demo Notifications ───────────────────────────────────────
export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: "ALERT" | "INFO" | "SUCCESS";
  timestamp: string;
  is_read: boolean;
  link?: string;
}

export const demoNotifications: SystemNotification[] = [
  {
    id: "notif-01",
    title: "🚨 تنبيه متابعة متأخرة عاجلة",
    description: "متابعة د. مروة الشاذلي (شركة تبارك) متأخرة منذ يومين. يرجى التواصل العاجل.",
    type: "ALERT",
    timestamp: "منذ ساعتين",
    is_read: false,
    link: "/follow-ups",
  },
  {
    id: "notif-02",
    title: "🎉 تم قبول عرض السعر بنجاح",
    description: "شركة النيل للمقاولات اعتمدت العرض رقم PROP-00101 بقيمة 520,000 ج.م.",
    type: "SUCCESS",
    timestamp: "أمس",
    is_read: false,
    link: "/proposals/prop-001",
  },
  {
    id: "notif-03",
    title: "💼 فرصة جديدة بالبايبلاين",
    description: "تمت إضافة صفقة جديدة: باقة المنصة السحابية لشركة تبارك بواسطة كريم فهمي.",
    type: "INFO",
    timestamp: "منذ 3 أيام",
    is_read: true,
    link: "/pipeline",
  },
];
