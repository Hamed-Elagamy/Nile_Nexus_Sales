import { z } from "zod";

export const createServiceSchema = z.object({
  name_ar: z.string().min(2, "يرجى كتابة اسم الخدمة بالعربية").trim(),
  name_en: z.string().min(2, "يرجى كتابة اسم الخدمة بالإنجليزية").trim(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  internal_reference_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default("EGP"),
  sort_order: z.coerce.number().int().default(0),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export const createLeadSourceSchema = z.object({
  name_ar: z.string().min(2, "يرجى كتابة اسم المصدر بالعربية").trim(),
  name_en: z.string().min(2, "يرجى كتابة اسم المصدر بالإنجليزية").trim(),
});

export type CreateLeadSourceInput = z.infer<typeof createLeadSourceSchema>;
