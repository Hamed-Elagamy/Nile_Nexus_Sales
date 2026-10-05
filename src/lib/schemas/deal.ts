import { z } from "zod";

export const DEAL_STAGES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "LATER",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const createDealSchema = z.object({
  title: z
    .string()
    .min(2, "Deal title must be at least 2 characters")
    .max(200, "Deal title must be at most 200 characters")
    .trim(),
  client_id: z.string().uuid("Please select a valid client"),
  sales_owner_id: z.string().uuid().optional().nullable(),
  stage: z.enum(DEAL_STAGES).default("NEW"),
  estimated_value: z.coerce.number().positive().optional().nullable(),
  currency: z.string().default("EGP"),
  notes: z.string().max(5000).optional().nullable(),
  service_ids: z.array(z.string().uuid()).default([]),
});

export type CreateDealInput = z.input<typeof createDealSchema>;

export const updateDealSchema = createDealSchema.partial().extend({
  final_value: z.coerce.number().positive().optional().nullable(),
  won_date: z.string().optional().nullable(),
  lost_reason_id: z.string().uuid().optional().nullable(),
  lost_notes: z.string().max(2000).optional().nullable(),
  resurface_date: z.string().optional().nullable(),
});

export type UpdateDealInput = z.input<typeof updateDealSchema>;

export const updateDealStageSchema = z.object({
  deal_id: z.string().uuid(),
  stage: z.enum(DEAL_STAGES),
  final_value: z.coerce.number().positive().optional().nullable(),
  lost_reason_id: z.string().uuid().optional().nullable(),
  lost_notes: z.string().max(2000).optional().nullable(),
  resurface_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;

export const filterDealsSchema = z.object({
  query: z.string().optional(),
  stage: z.enum(DEAL_STAGES).optional(),
  client_id: z.string().uuid().optional(),
  sales_owner_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterDealsInput = z.infer<typeof filterDealsSchema>;
