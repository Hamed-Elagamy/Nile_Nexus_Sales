import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/schemas/potential-client";

export const COFFEX_ACTIVITY_TYPES = [
  "SPECIALTY_CAFE",
  "COMMERCIAL_CAFE",
  "ROASTERY",
  "COFFEE_KIOSK",
  "BAKERY_CAFE",
  "SUPPLIER",
  "RESTAURANT_CAFE",
  "OTHER",
] as const;

export const COFFEX_CURRENT_SYSTEMS = [
  "NONE",
  "FOODICS",
  "QUICK_POS",
  "PRODELAND",
  "LEGACY_POS",
  "CUSTOM",
  "OTHER",
] as const;

export const COFFEX_BRANCHES_COUNTS = ["1", "2-3", "4-6", "7-10", "10+"] as const;

export const COFFEX_DAILY_VOLUMES = [
  "UNDER_100",
  "100_300",
  "300_600",
  "OVER_600",
] as const;

export const COFFEX_INTEREST_LEVELS = ["HOT", "WARM", "COLD"] as const;

export const COFFEX_DECISION_MAKER_ROLES = [
  "OWNER",
  "GM",
  "BRANCH_MANAGER",
  "HEAD_BARISTA",
  "PURCHASING",
  "OTHER",
] as const;

export const COFFEX_STATUSES = [
  "NEW",
  "CONTACTED",
  "DEMO_SCHEDULED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

export const COFFEX_AVAILABLE_MODULES = [
  "POS",
  "RECIPES",
  "QR_MENU",
  "KDS",
  "LOYALTY",
  "DELIVERY",
  "E_INVOICE",
  "MULTI_BRANCH",
] as const;

export const createCoffexLeadSchema = z.object({
  brand_name: z
    .string()
    .min(2, { message: "Brand or Cafe name must be at least 2 characters" })
    .max(150, { message: "Brand name must not exceed 150 characters" })
    .trim(),
  contact_name: z
    .string()
    .min(2, { message: "Contact person name must be at least 2 characters" })
    .max(100, { message: "Contact name must not exceed 100 characters" })
    .trim(),
  contact_role: z.enum(COFFEX_DECISION_MAKER_ROLES).default("OWNER"),
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
  activity_type: z.enum(COFFEX_ACTIVITY_TYPES).default("SPECIALTY_CAFE"),
  branches_count: z.enum(COFFEX_BRANCHES_COUNTS).default("1"),
  current_system: z.enum(COFFEX_CURRENT_SYSTEMS).default("NONE"),
  daily_orders_volume: z.enum(COFFEX_DAILY_VOLUMES).optional().nullable(),
  interested_modules: z.array(z.string()).default([]),
  interest_level: z.enum(COFFEX_INTEREST_LEVELS).default("WARM"),
  estimated_budget: z.coerce.number().min(0).optional().nullable().default(0),
  next_action: z.string().max(250).optional().nullable(),
  next_action_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export type CreateCoffexLeadInput = z.input<typeof createCoffexLeadSchema>;
export type CreateCoffexLeadOutput = z.output<typeof createCoffexLeadSchema>;

export const updateCoffexLeadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(COFFEX_STATUSES),
});

export type UpdateCoffexLeadStatusInput = z.infer<typeof updateCoffexLeadStatusSchema>;
