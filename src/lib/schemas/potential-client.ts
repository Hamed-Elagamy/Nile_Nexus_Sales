import { z } from "zod";

export const OPPORTUNITY_INDICATORS = [
  "WEBSITE",
  "ECOMMERCE",
  "SOCIAL_MEDIA",
  "BRANDING",
  "ERP_SYSTEM",
  "MARKETING",
  "MOBILE_APP",
  "OTHER",
] as const;

export type OpportunityIndicatorType = (typeof OPPORTUNITY_INDICATORS)[number];

export const POTENTIAL_CLIENT_STATUSES = [
  "NEW",
  "RESEARCHING",
  "RESEARCHED",
  "CONVERTED",
  "ARCHIVED",
] as const;

export type PotentialClientStatusType = (typeof POTENTIAL_CLIENT_STATUSES)[number];

export function normalizePhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+]/g, "").trim();
  return cleaned || null;
}

export const createPotentialClientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(200, { message: "Name must be at most 200 characters" })
    .trim(),
  area: z.string().max(100).optional().nullable(),
  phone: z
    .string()
    .max(30)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const normalized = normalizePhoneNumber(val);
        return normalized !== null && normalized.length >= 7;
      },
      { message: "Please provide a valid phone number (at least 7 digits)" }
    ),
  website: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          const withProto = val.startsWith("http://") || val.startsWith("https://")
            ? val
            : `https://${val}`;
          new URL(withProto);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please provide a valid website URL" }
    ),
  instagram: z.string().max(255).optional().nullable(),
  facebook: z.string().max(255).optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  research_owner_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  opportunities: z.array(z.enum(OPPORTUNITY_INDICATORS)).default([]),
});

export type CreatePotentialClientInput = z.input<typeof createPotentialClientSchema>;

export const updatePotentialClientSchema = createPotentialClientSchema.partial().extend({
  status: z.enum(POTENTIAL_CLIENT_STATUSES).optional(),
});

export type UpdatePotentialClientInput = z.infer<typeof updatePotentialClientSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(POTENTIAL_CLIENT_STATUSES),
  notes: z.string().max(2000).optional().nullable(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const filterPotentialClientSchema = z.object({
  query: z.string().optional(),
  status: z.enum(POTENTIAL_CLIENT_STATUSES).optional(),
  research_owner_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterPotentialClientInput = z.infer<typeof filterPotentialClientSchema>;

export const convertPotentialClientSchema = z.object({
  potential_client_id: z.string().uuid(),
  client_type: z.enum(["COMPANY", "INDIVIDUAL"]).default("COMPANY"),
  create_initial_deal: z.boolean().default(false),
  deal_title: z.string().min(2).max(200).optional(),
  deal_estimated_value: z.number().positive().optional(),
  deal_currency: z.string().default("EGP"),
  primary_contact_name: z.string().max(100).optional(),
  primary_contact_phone: z.string().max(30).optional(),
  primary_contact_email: z.string().email().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export type ConvertPotentialClientInput = z.infer<typeof convertPotentialClientSchema>;
