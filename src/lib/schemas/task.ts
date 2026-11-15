import { z } from "zod";

export const taskPriorityEnum = z.enum(["NORMAL", "IMPORTANT", "URGENT"]);
export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: "عنوان المهمة يجب أن يكون حرفين على الأقل" })
    .max(255, { message: "عنوان المهمة طويل جداً" })
    .trim(),
  notes: z.string().trim().optional().nullable(),
  priority: taskPriorityEnum.optional().default("NORMAL"),
  deadline: z.string().optional().nullable(),
  assignee_id: z
    .string()
    .min(1, { message: "يرجى تحديد المسؤول" }),
  client_id: z.string().optional().nullable(),
  deal_id: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1, "معرف المهمة مطلوب"),
  title: z.string().trim().min(2).max(255).optional(),
  notes: z.string().trim().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  deadline: z.string().optional().nullable(),
  assignee_id: z.string().optional(),
  client_id: z.string().optional().nullable(),
  deal_id: z.string().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().min(1, "معرف المهمة مطلوب"),
  status: taskStatusEnum,
});

export const filterTasksSchema = z.object({
  status: z.enum(["ALL", "TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["ALL", "NORMAL", "IMPORTANT", "URGENT"]).optional(),
  assignee_id: z.string().optional(),
  search: z.string().optional(),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type FilterTasksInput = z.infer<typeof filterTasksSchema>;
