import { z } from "zod";

export const PROPOSAL_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "READY",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "SUPERSEDED",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const proposalItemSchema = z.object({
  service_id: z.string().uuid().optional().nullable(),
  description_ar: z.string().min(2, "يرجى كتابة وصف البند بالعربية").trim(),
  description_en: z.string().optional().nullable(),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر").default(1),
  unit_price: z.coerce.number().min(0, "سعر الوحدة لا يمكن أن يكون بالسالب").default(0),
  sort_order: z.coerce.number().int().default(0),
});

export type ProposalItemInput = z.infer<typeof proposalItemSchema>;

export const createProposalSchema = z.object({
  client_id: z.string().uuid("يرجى اختيار العميل"),
  deal_id: z.string().uuid("يرجى اختيار الصفقة المرتبطة"),
  items: z.array(proposalItemSchema).min(1, "يجب إضافة بند واحد على الأقل في عرض السعر"),
  currency: z.string().default("EGP"),
  discount_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  discount_amount: z.coerce.number().min(0).optional().nullable(),
  tax_percentage: z.coerce.number().min(0).max(100).default(0),
  valid_until: z.string().optional().nullable(),
  delivery_duration: z.string().max(200).optional().nullable(),
  payment_terms: z.string().max(2000).optional().nullable(),
  terms_and_conditions: z.string().max(5000).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
});

export type CreateProposalInput = z.input<typeof createProposalSchema>;

export const createProposalVersionSchema = z.object({
  proposal_id: z.string().uuid("يرجى تحديد عرض السعر الأساسي"),
  items: z.array(proposalItemSchema).min(1, "يجب إضافة بند واحد على الأقل"),
  currency: z.string().default("EGP"),
  discount_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  discount_amount: z.coerce.number().min(0).optional().nullable(),
  tax_percentage: z.coerce.number().min(0).max(100).default(0),
  valid_until: z.string().optional().nullable(),
  delivery_duration: z.string().max(200).optional().nullable(),
  payment_terms: z.string().max(2000).optional().nullable(),
  terms_and_conditions: z.string().max(5000).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
});

export type CreateProposalVersionInput = z.input<typeof createProposalVersionSchema>;

export const updateProposalVersionStatusSchema = z.object({
  version_id: z.string().uuid(),
  status: z.enum(PROPOSAL_STATUSES),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateProposalVersionStatusInput = z.infer<typeof updateProposalVersionStatusSchema>;

export const filterProposalsSchema = z.object({
  query: z.string().optional(),
  status: z.enum(PROPOSAL_STATUSES).optional(),
  client_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterProposalsInput = z.input<typeof filterProposalsSchema>;
