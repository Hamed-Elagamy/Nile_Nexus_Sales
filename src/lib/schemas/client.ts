import { z } from "zod";
import { normalizePhoneNumber } from "./potential-client";

export const CLIENT_TYPES = ["COMPANY", "INDIVIDUAL"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const createClientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(200, { message: "Name must be at most 200 characters" })
    .trim(),
  type: z.enum(CLIENT_TYPES).default("COMPANY"),
  area: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  website: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          const withProto =
            val.startsWith("http://") || val.startsWith("https://")
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
      { message: "Please provide a valid phone number" }
    ),
  email: z.string().email("Invalid email address").optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  account_owner_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  // Initial primary contact (optional upon creation)
  primary_contact: z
    .object({
      name: z.string().min(2).max(100),
      job_title: z.string().max(100).optional().nullable(),
      phone: z.string().max(30).optional().nullable(),
      whatsapp: z.string().max(30).optional().nullable(),
      email: z.string().email().optional().nullable(),
    })
    .optional(),
});

export type CreateClientInput = z.input<typeof createClientSchema>;

export const updateClientSchema = createClientSchema
  .omit({ primary_contact: true })
  .partial();

export type UpdateClientInput = z.input<typeof updateClientSchema>;

export const contactSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(2, "Contact name must be at least 2 characters").max(100).trim(),
  job_title: z.string().max(100).optional().nullable(),
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
      { message: "Invalid phone number" }
    ),
  whatsapp: z.string().max(30).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  is_primary: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export type ContactInput = z.input<typeof contactSchema>;

export const filterClientsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(CLIENT_TYPES).optional(),
  account_owner_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterClientsInput = z.infer<typeof filterClientsSchema>;
