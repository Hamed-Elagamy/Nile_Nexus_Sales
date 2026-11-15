"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  demoTasks,
  demoProfiles,
  demoClients,
  demoDeals,
} from "@/lib/demo-data";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  filterTasksSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
  type FilterTasksInput,
} from "@/lib/schemas/task";
import type { TaskWithRelations, TasksListResult, TaskFormData } from "@/types/task";
import type { TaskPriority, TaskStatus } from "@/types/domain";
import { broadcastNotification } from "@/lib/actions/notifications";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Fetch tasks with joins and calculated summary metrics
 */
export async function getTasks(
  filters: FilterTasksInput = {}
): Promise<ActionResult<TasksListResult>> {
  try {
    const parsed = filterTasksSchema.parse(filters);

    if (!isSupabaseConfigured()) {
      let filtered = [...demoTasks];

      if (parsed.status && parsed.status !== "ALL") {
        filtered = filtered.filter((t) => t.status === parsed.status);
      }
      if (parsed.priority && parsed.priority !== "ALL") {
        filtered = filtered.filter((t) => t.priority === parsed.priority);
      }
      if (parsed.assignee_id) {
        filtered = filtered.filter((t) => t.assignee_id === parsed.assignee_id);
      }
      if (parsed.search) {
        const query = parsed.search.toLowerCase().trim();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.notes && t.notes.toLowerCase().includes(query))
        );
      }

      const items: TaskWithRelations[] = filtered.map((task) => {
        const assignee = demoProfiles.find((p) => p.id === task.assignee_id);
        const client = demoClients.find((c) => c.id === task.client_id);
        const deal = demoDeals.find((d) => d.id === task.deal_id);
        const creator = demoProfiles.find((p) => p.id === task.created_by);

        return {
          ...task,
          assignee: assignee ? { id: assignee.id, full_name: assignee.full_name, role: assignee.role } : null,
          client: client ? { id: client.id, name: client.name } : null,
          deal: deal ? { id: deal.id, title: deal.title } : null,
          creator: creator ? { id: creator.id, full_name: creator.full_name } : null,
        };
      });

      const metrics = {
        total: demoTasks.length,
        urgent: demoTasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE" && t.status !== "CANCELLED").length,
        inProgress: demoTasks.filter((t) => t.status === "IN_PROGRESS").length,
        done: demoTasks.filter((t) => t.status === "DONE").length,
        todo: demoTasks.filter((t) => t.status === "TODO").length,
      };

      return {
        success: true,
        data: { items, metrics },
      };
    }

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("tasks")
      .select(`
        id, title, notes, priority, status, deadline, created_by, created_at, updated_at, assignee_id, client_id, deal_id,
        assignee:profiles!assignee_id(id, full_name, role),
        client:clients!client_id(id, name),
        deal:deals!deal_id(id, title)
      `)
      .order("created_at", { ascending: false });

    if (parsed.status && parsed.status !== "ALL") {
      query = query.eq("status", parsed.status);
    }
    if (parsed.priority && parsed.priority !== "ALL") {
      query = query.eq("priority", parsed.priority);
    }
    if (parsed.assignee_id) {
      query = query.eq("assignee_id", parsed.assignee_id);
    }

    const { data: rawTasks, error } = await query;

    if (error) {
      console.error("[getTasks] Supabase error:", error);
      return {
        success: false,
        error: error.message || "فشل تحميل المهام",
      };
    }

    let items: TaskWithRelations[] = ((rawTasks as unknown as TaskWithRelations[]) || []).map((t) => ({
      ...t,
      priority: (t.priority as TaskPriority) || "NORMAL",
      status: (t.status as TaskStatus) || "TODO",
    }));

    if (parsed.search) {
      const q = parsed.search.toLowerCase().trim();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.assignee?.full_name && t.assignee.full_name.toLowerCase().includes(q)) ||
          (t.client?.name && t.client.name.toLowerCase().includes(q))
      );
    }

    // Fetch metrics from all tasks in database
    const { data: allRawTasks } = await supabase
      .from("tasks")
      .select("id, priority, status");

    const allList = allRawTasks || [];
    const metrics = {
      total: allList.length,
      urgent: allList.filter((t) => t.priority === "URGENT" && t.status !== "DONE" && t.status !== "CANCELLED").length,
      inProgress: allList.filter((t) => t.status === "IN_PROGRESS").length,
      done: allList.filter((t) => t.status === "DONE").length,
      todo: allList.filter((t) => t.status === "TODO").length,
    };

    return {
      success: true,
      data: {
        items,
        metrics,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل غير متوقع أثناء جلب المهام"),
    };
  }
}

/**
 * Create a new task
 */
export async function createTask(
  rawInput: CreateTaskInput
): Promise<ActionResult<TaskWithRelations>> {
  try {
    const parsed = createTaskSchema.parse(rawInput);

    if (!isSupabaseConfigured()) {
      const newTask: any = {
        id: crypto.randomUUID(),
        title: parsed.title,
        notes: parsed.notes || null,
        priority: parsed.priority || "NORMAL",
        status: "TODO",
        deadline: parsed.deadline ? new Date(parsed.deadline).toISOString() : null,
        assignee_id: parsed.assignee_id,
        client_id: parsed.client_id || null,
        deal_id: parsed.deal_id || null,
        created_by: "usr-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoTasks.unshift(newTask);
      revalidatePath("/tasks");
      return { success: true, data: newTask };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "يجب تسجيل الدخول لإنشاء مهمة جديدة",
      };
    }

    const insertPayload = {
      title: parsed.title,
      notes: parsed.notes || null,
      priority: parsed.priority || "NORMAL",
      status: "TODO" as const,
      deadline: parsed.deadline ? new Date(parsed.deadline).toISOString() : null,
      assignee_id: parsed.assignee_id,
      client_id: parsed.client_id || null,
      deal_id: parsed.deal_id || null,
      created_by: user.id,
    };

    const { data: created, error } = await supabase
      .from("tasks")
      .insert(insertPayload)
      .select(`
        id, title, notes, priority, status, deadline, created_by, created_at, updated_at, assignee_id, client_id, deal_id,
        assignee:profiles!assignee_id(id, full_name, role),
        client:clients!client_id(id, name),
        deal:deals!deal_id(id, title)
      `)
      .single();

    if (error || !created) {
      console.error("[createTask] Error:", error);
      return {
        success: false,
        error: error?.message || "فشل حفظ المهمة في قاعدة البيانات",
      };
    }

    // Live notification dispatch across team devices
    try {
      await broadcastNotification({
        title: "📌 مهمة تنفيذية جديدة",
        body: `تم إنشاء مهمة: ${parsed.title}${parsed.deadline ? ` (تاريخ الاستحقاق: ${parsed.deadline})` : ""}`,
        category: "ACTION_REQUIRED",
        type: "INFO",
        link: "/tasks",
        targetUserIds: parsed.assignee_id ? [parsed.assignee_id] : [],
        notifyAdminsAndGMs: true,
      });
    } catch {
      // Non-blocking notification
    }

    // Log activity
    try {
      await supabase.from("activities").insert({
        actor_id: user.id,
        type: "NOTE",
        summary: `تم إنشاء مهمة تنفيذية: ${parsed.title}`,
        client_id: parsed.client_id || null,
        deal_id: parsed.deal_id || null,
      });
    } catch {
      // Non-blocking activity log
    }

    revalidatePath("/tasks");
    return { success: true, data: created as unknown as TaskWithRelations };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل التحقق من بيانات المهمة"),
    };
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  rawInput: UpdateTaskInput
): Promise<ActionResult<TaskWithRelations>> {
  try {
    const parsed = updateTaskSchema.parse(rawInput);

    if (!isSupabaseConfigured()) {
      const idx = demoTasks.findIndex((t) => t.id === parsed.id);
      if (idx === -1) {
        return { success: false, error: "المهمة غير موجودة" };
      }
      demoTasks[idx] = {
        ...demoTasks[idx],
        ...(parsed.title ? { title: parsed.title } : {}),
        ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
        ...(parsed.priority ? { priority: parsed.priority } : {}),
        ...(parsed.status ? { status: parsed.status } : {}),
        ...(parsed.deadline !== undefined ? { deadline: parsed.deadline } : {}),
        ...(parsed.assignee_id ? { assignee_id: parsed.assignee_id } : {}),
        ...(parsed.client_id !== undefined ? { client_id: parsed.client_id } : {}),
        ...(parsed.deal_id !== undefined ? { deal_id: parsed.deal_id } : {}),
        updated_at: new Date().toISOString(),
      };
      revalidatePath("/tasks");
      return { success: true, data: demoTasks[idx] as unknown as TaskWithRelations };
    }

    const supabase = await createSupabaseServerClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.title) updatePayload.title = parsed.title;
    if (parsed.notes !== undefined) updatePayload.notes = parsed.notes;
    if (parsed.priority) updatePayload.priority = parsed.priority;
    if (parsed.status) updatePayload.status = parsed.status;
    if (parsed.deadline !== undefined) {
      updatePayload.deadline = parsed.deadline ? new Date(parsed.deadline).toISOString() : null;
    }
    if (parsed.assignee_id) updatePayload.assignee_id = parsed.assignee_id;
    if (parsed.client_id !== undefined) updatePayload.client_id = parsed.client_id;
    if (parsed.deal_id !== undefined) updatePayload.deal_id = parsed.deal_id;

    const { data: updated, error } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", parsed.id)
      .select(`
        id, title, notes, priority, status, deadline, created_by, created_at, updated_at, assignee_id, client_id, deal_id,
        assignee:profiles!assignee_id(id, full_name, role),
        client:clients!client_id(id, name),
        deal:deals!deal_id(id, title)
      `)
      .single();

    if (error || !updated) {
      console.error("[updateTask] Error:", error);
      return {
        success: false,
        error: error?.message || "فشل تحديث المهمة",
      };
    }

    revalidatePath("/tasks");
    return { success: true, data: updated as unknown as TaskWithRelations };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل تحديث بيانات المهمة"),
    };
  }
}

/**
 * Fast status toggle / update (TODO, IN_PROGRESS, DONE, CANCELLED)
 */
export async function updateTaskStatus(
  rawInput: UpdateTaskStatusInput
): Promise<ActionResult<void>> {
  try {
    const parsed = updateTaskStatusSchema.parse(rawInput);

    if (!isSupabaseConfigured()) {
      const idx = demoTasks.findIndex((t) => t.id === parsed.id);
      if (idx !== -1) {
        demoTasks[idx].status = parsed.status;
        demoTasks[idx].updated_at = new Date().toISOString();
      }
      revalidatePath("/tasks");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: parsed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.id);

    if (error) {
      console.error("[updateTaskStatus] Error:", error);
      return {
        success: false,
        error: error.message || "فشل تعديل حالة المهمة",
      };
    }

    revalidatePath("/tasks");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل تعديل حالة المهمة"),
    };
  }
}

/**
 * Delete or soft-cancel a task
 */
export async function deleteTask(id: string): Promise<ActionResult<void>> {
  try {
    if (!isSupabaseConfigured()) {
      const idx = demoTasks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        demoTasks.splice(idx, 1);
      }
      revalidatePath("/tasks");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    // Try hard delete first
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    // If RLS rejects hard delete, fall back to soft-delete (status = 'CANCELLED')
    if (deleteError) {
      console.warn("[deleteTask] Hard delete failed, falling back to CANCELLED status:", deleteError.message);
      const { error: cancelError } = await supabase
        .from("tasks")
        .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (cancelError) {
        return {
          success: false,
          error: cancelError.message || "فشل حذف المهمة",
        };
      }
    }

    revalidatePath("/tasks");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل حذف المهمة"),
    };
  }
}

/**
 * Fetch profiles, clients, and deals needed for task forms
 */
export async function getTaskFormData(): Promise<ActionResult<TaskFormData>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        data: {
          profiles: demoProfiles.map((p) => ({ id: p.id, full_name: p.full_name, role: p.role })),
          clients: demoClients.map((c) => ({ id: c.id, name: c.name })),
          deals: demoDeals.map((d) => ({ id: d.id, title: d.title })),
          currentUserId: demoProfiles[0]?.id || "usr-001",
        },
      };
    }

    const supabase = await createSupabaseServerClient();

    const [profilesRes, clientsRes, dealsRes, authRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, role").eq("is_active", true).order("full_name"),
      supabase.from("clients").select("id, name").order("name"),
      supabase.from("deals").select("id, title").order("title"),
      supabase.auth.getUser(),
    ]);

    return {
      success: true,
      data: {
        profiles: profilesRes.data || [],
        clients: clientsRes.data || [],
        deals: dealsRes.data || [],
        currentUserId: authRes.data.user?.id,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "فشل جلب خيارات النموذج"),
    };
  }
}
