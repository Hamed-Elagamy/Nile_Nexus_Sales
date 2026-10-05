import { z } from "zod";

export const ROLES = ["GM", "ADMIN", "SALES"] as const;
export type UserRole = (typeof ROLES)[number];

export const updateMemberRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(ROLES),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const toggleMemberStatusSchema = z.object({
  user_id: z.string().uuid(),
  is_active: z.boolean(),
});

export type ToggleMemberStatusInput = z.infer<typeof toggleMemberStatusSchema>;
