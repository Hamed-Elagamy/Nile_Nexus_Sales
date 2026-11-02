import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/schemas/potential-client";

export const NEXA_VERTICAL_TYPES = [
  "FASHION_APPAREL",
  "RESTAURANTS_CAFES",
  "SUPERMARKET_GROCERY",
  "ELECTRONICS_APPLIANCES",
  "BEAUTY_COSMETICS",
  "HOME_FURNITURE",
  "PHARMACY_HEALTH",
  "GENERAL_RETAIL",
  "OTHER",
] as const;

export const NEXA_COMMERCE_MODELS = [
  "ONLINE_ONLY",
  "RETAIL_STORES_ONLY",
  "OMNICHANNEL",
  "SOCIAL_COMMERCE",
  "OTHER",
] as const;

export const NEXA_CURRENT_SYSTEMS = [
  "NONE_EXCEL",
  "SHOPIFY",
  "WOOCOMMERCE",
  "SALLA_ZID",
  "LOCAL_POS",
  "CUSTOM",
  "OTHER",
] as const;

export const NEXA_BRANCHES_COUNTS = ["1", "2-3", "4-6", "7-10", "10+"] as const;

export const NEXA_ORDER_VOLUMES = [
  "UNDER_100",
  "100_500",
  "500_2000",
  "OVER_2000",
] as const;

export const NEXA_PLAN_INTERESTS = [
  "STARTER",
  "GROWTH",
  "ENTERPRISE",
  "OMNICHANNEL_POS",
  "AGENCY_MANAGED",
] as const;

export const NEXA_INTEREST_LEVELS = ["HOT", "WARM", "COLD"] as const;

export const NEXA_DECISION_MAKER_ROLES = [
  "OWNER",
  "GM",
  "STORE_MANAGER",
  "ECOMMERCE_HEAD",
  "MARKETING_HEAD",
  "OPERATIONS",
  "OTHER",
] as const;

export const NEXA_STATUSES = [
  "NEW",
  "CONTACTED",
  "DEMO_SCHEDULED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

export const createNexaLeadSchema = z.object({
  brand_name: z
    .string()
    .min(2, { message: "Brand or Store name must be at least 2 characters" })
    .max(150, { message: "Brand name must not exceed 150 characters" })
    .trim(),
  contact_name: z
    .string()
    .min(2, { message: "Contact person name must be at least 2 characters" })
    .max(100, { message: "Contact name must not exceed 100 characters" })
    .trim(),
  contact_role: z.enum(NEXA_DECISION_MAKER_ROLES).default("OWNER"),
  phone: z
    .string()
    .min(7, { message: "Phone number is too short (at least 7 digits)" })
    .max(30, { message: "Phone number is too long" })
    .refine((val) => {
      const norm = normalizePhoneNumber(val);
      return norm !== null && norm.length >= 7;
    }, { message: "Please enter a valid phone number" }),
  alternative_phone: z.string().max(30).optional().nullable(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .max(150)
    .optional()
    .nullable()
    .or(z.literal("")),
  store_url: z.string().max(300).optional().nullable().or(z.literal("")),
  city: z.string().min(2).max(60).default("القاهرة"),
  area: z
    .string()
    .min(2, { message: "Area/District is required (e.g. New Cairo, Maadi, Zayed)" })
    .max(100)
    .trim(),
  address: z.string().max(250).optional().nullable(),
  gps_latitude: z.number().optional().nullable(),
  gps_longitude: z.number().optional().nullable(),
  gps_maps_url: z.string().url().optional().nullable().or(z.literal("")),
  vertical_type: z.enum(NEXA_VERTICAL_TYPES).default("FASHION_APPAREL"),
  commerce_model: z.enum(NEXA_COMMERCE_MODELS).default("OMNICHANNEL"),
  current_system: z.enum(NEXA_CURRENT_SYSTEMS).default("NONE_EXCEL"),
  monthly_order_volume: z.enum(NEXA_ORDER_VOLUMES).optional().nullable().default("100_500"),
  branches_count: z.enum(NEXA_BRANCHES_COUNTS).default("1"),
  plan_interest: z.enum(NEXA_PLAN_INTERESTS).default("GROWTH"),
  interest_level: z.enum(NEXA_INTEREST_LEVELS).default("WARM"),
  estimated_budget: z.coerce.number().min(0).optional().nullable().default(0),
  next_action: z.string().max(250).optional().nullable(),
  next_action_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export type CreateNexaLeadInput = z.input<typeof createNexaLeadSchema>;
export type CreateNexaLeadOutput = z.output<typeof createNexaLeadSchema>;

export const updateNexaLeadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(NEXA_STATUSES),
});

export type UpdateNexaLeadStatusInput = z.infer<typeof updateNexaLeadStatusSchema>;
