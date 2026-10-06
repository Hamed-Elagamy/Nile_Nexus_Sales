import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  preferred_locale: z.enum(["ar", "en"]).default("ar"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
