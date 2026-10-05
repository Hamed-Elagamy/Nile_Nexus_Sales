import { z } from "zod";

export const FOLLOW_UP_ACTIONS = [
  "CALL",
  "MEETING",
  "WHATSAPP",
  "EMAIL",
  "VISIT",
  "OTHER",
] as const;

export type FollowUpActionType = (typeof FOLLOW_UP_ACTIONS)[number];

export const FOLLOW_UP_STATUSES = [
  "PENDING",
  "COMPLETED",
  "POSTPONED",
  "CANCELLED",
] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export const createFollowUpSchema = z.object({
  client_id: z.string().uuid("يرجى اختيار العميل"),
  deal_id: z.string().uuid().optional().nullable(),
  responsible_id: z.string().uuid().optional().nullable(),
  due_at: z.string().min(1, "يرجى تحديد موعد المتابعة"),
  action: z.string().min(2, "يرجى تحديد نوع الإجراء").default("CALL"),
  notes: z.string().max(3000).optional().nullable(),
});

export type CreateFollowUpInput = z.input<typeof createFollowUpSchema>;

export const completeFollowUpSchema = z.object({
  follow_up_id: z.string().uuid(),
  completion_result: z
    .string()
    .min(2, "يرجى كتابة نتيجة المتابعة")
    .max(3000),
  schedule_next: z.boolean().default(false),
  next_action: z.string().optional(),
  next_due_at: z.string().optional(),
  next_notes: z.string().max(3000).optional().nullable(),
});

export type CompleteFollowUpInput = z.input<typeof completeFollowUpSchema>;

export const rescheduleFollowUpSchema = z.object({
  follow_up_id: z.string().uuid(),
  new_due_at: z.string().min(1, "يرجى تحديد الموعد الجديد"),
  reason: z.string().max(1000).optional().nullable(),
});

export type RescheduleFollowUpInput = z.input<typeof rescheduleFollowUpSchema>;

export const filterFollowUpsSchema = z.object({
  tab: z.enum(["TODAY", "OVERDUE", "UPCOMING", "COMPLETED", "ALL"]).default("TODAY"),
  client_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  responsible_id: z.string().uuid().optional(),
  action: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterFollowUpsInput = z.input<typeof filterFollowUpsSchema>;
