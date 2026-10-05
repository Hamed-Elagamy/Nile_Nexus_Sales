"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  demoClients,
  demoDeals,
  demoFollowUps,
  demoProfiles,
} from "@/lib/demo-data";
import {
  createFollowUpSchema,
  completeFollowUpSchema,
  rescheduleFollowUpSchema,
  filterFollowUpsSchema,
  type CreateFollowUpInput,
  type CompleteFollowUpInput,
  type RescheduleFollowUpInput,
  type FilterFollowUpsInput,
} from "@/lib/schemas/follow-up";
import type { FollowUp, Client, Deal } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface FollowUpWithRelations extends FollowUp {
  client?: Pick<Client, "id" | "name" | "business_id" | "phone" | "type"> | null;
  deal?: Pick<Deal, "id" | "title" | "business_id" | "estimated_value" | "stage"> | null;
  responsible?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface FollowUpsDashboardResult {
  items: FollowUpWithRelations[];
  counts: {
    today: number;
    overdue: number;
    upcoming: number;
    completed: number;
    all: number;
  };
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Fetch follow-ups partitioned by tabs (TODAY, OVERDUE, UPCOMING, COMPLETED, ALL)
 */
export async function getFollowUps(
  filters: FilterFollowUpsInput = {}
): Promise<ActionResult<FollowUpsDashboardResult>> {
  try {
    const parsed = filterFollowUpsSchema.parse(filters);

    if (!isSupabaseConfigured()) {
      const todayCount = demoFollowUps.filter((f) => f.status === "PENDING" && f.id !== "flw-003" && f.id !== "flw-004").length;
      const overdueCount = demoFollowUps.filter((f) => f.id === "flw-003").length;
      const upcomingCount = demoFollowUps.filter((f) => f.id === "flw-004").length;
      const completedCount = demoFollowUps.filter((f) => f.status === "COMPLETED").length;
      const allCount = demoFollowUps.length;

      let filtered = [...demoFollowUps];
      switch (parsed.tab) {
        case "TODAY":
          filtered = filtered.filter((f) => f.status === "PENDING" && f.id !== "flw-003" && f.id !== "flw-004");
          break;
        case "OVERDUE":
          filtered = filtered.filter((f) => f.id === "flw-003");
          break;
        case "UPCOMING":
          filtered = filtered.filter((f) => f.id === "flw-004");
          break;
        case "COMPLETED":
          filtered = filtered.filter((f) => f.status === "COMPLETED");
          break;
      }

      const items: FollowUpWithRelations[] = filtered.map((f) => {
        const client = demoClients.find((c) => c.id === f.client_id);
        const deal = demoDeals.find((d) => d.id === f.deal_id);
        const resp = demoProfiles.find((p) => p.id === f.responsible_id);
        return {
          ...f,
          client: client
            ? {
                id: client.id,
                name: client.name,
                business_id: client.business_id,
                phone: client.phone,
                type: client.type,
              }
            : null,
          deal: deal
            ? {
                id: deal.id,
                title: deal.title,
                business_id: deal.business_id,
                estimated_value: deal.estimated_value,
                stage: deal.stage,
              }
            : null,
          responsible: resp ? { id: resp.id, full_name: resp.full_name, email: resp.email } : null,
        };
      });

      return {
        success: true,
        data: {
          items,
          counts: {
            today: todayCount,
            overdue: overdueCount,
            upcoming: upcomingCount,
            completed: completedCount,
            all: allCount,
          },
          total: items.length,
          page: parsed.page || 1,
          pageSize: parsed.pageSize || 20,
          totalPages: 1,
        },
      };
    }

    const supabase = await createSupabaseServerClient();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const [todayCountRes, overdueCountRes, upcomingCountRes, completedCountRes, allCountRes] =
      await Promise.all([
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("status", "PENDING")
          .gte("due_at", startOfToday)
          .lte("due_at", endOfToday),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("status", "PENDING")
          .lt("due_at", startOfToday),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("status", "PENDING")
          .gt("due_at", endOfToday),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("status", "COMPLETED"),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true }),
      ]);

    const counts = {
      today: todayCountRes.count || 0,
      overdue: overdueCountRes.count || 0,
      upcoming: upcomingCountRes.count || 0,
      completed: completedCountRes.count || 0,
      all: allCountRes.count || 0,
    };

    let query = supabase
      .from("follow_ups")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, type),
        deal:deals!deal_id(id, title, business_id, estimated_value, stage),
        responsible:profiles!responsible_id(id, full_name, email)
      `,
        { count: "exact" }
      );

    if (parsed.client_id) {
      query = query.eq("client_id", parsed.client_id);
    }
    if (parsed.deal_id) {
      query = query.eq("deal_id", parsed.deal_id);
    }
    if (parsed.responsible_id) {
      query = query.eq("responsible_id", parsed.responsible_id);
    }
    if (parsed.action) {
      query = query.eq("action", parsed.action);
    }

    switch (parsed.tab) {
      case "TODAY":
        query = query
          .eq("status", "PENDING")
          .gte("due_at", startOfToday)
          .lte("due_at", endOfToday)
          .order("due_at", { ascending: true });
        break;
      case "OVERDUE":
        query = query
          .eq("status", "PENDING")
          .lt("due_at", startOfToday)
          .order("due_at", { ascending: true });
        break;
      case "UPCOMING":
        query = query
          .eq("status", "PENDING")
          .gt("due_at", endOfToday)
          .order("due_at", { ascending: true });
        break;
      case "COMPLETED":
        query = query
          .eq("status", "COMPLETED")
          .order("completed_at", { ascending: false });
        break;
      case "ALL":
      default:
        query = query.order("due_at", { ascending: false });
        break;
    }

    const page = parsed.page || 1;
    const pageSize = parsed.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const items = (data || []) as unknown as FollowUpWithRelations[];
    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      success: true,
      data: {
        items,
        counts,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load follow-ups") };
  }
}

/**
 * Schedule a new follow-up
 */
export async function createFollowUp(
  input: CreateFollowUpInput
): Promise<ActionResult<FollowUp>> {
  try {
    const validated = createFollowUpSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const newFlw: FollowUp = {
        id: `flw-${Date.now().toString().slice(-4)}`,
        client_id: validated.client_id,
        deal_id: validated.deal_id || null,
        responsible_id: validated.responsible_id || demoProfiles[2].id,
        due_at: validated.due_at,
        action: validated.action,
        notes: validated.notes || null,
        status: "PENDING",
        completion_result: null,
        completed_at: null,
        created_by: demoProfiles[2].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoFollowUps.unshift(newFlw);
      revalidatePath("/follow-ups");
      return { success: true, data: newFlw };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const responsibleId = validated.responsible_id || user.id;

    const { data: inserted, error: insertError } = await supabase
      .from("follow_ups")
      .insert({
        client_id: validated.client_id,
        deal_id: validated.deal_id || null,
        responsible_id: responsibleId,
        due_at: validated.due_at,
        action: validated.action,
        notes: validated.notes || null,
        status: "PENDING",
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || "Failed to create follow-up" };
    }

    await supabase.from("activities").insert({
      type: "FOLLOW_UP",
      actor_id: user.id,
      client_id: validated.client_id,
      deal_id: validated.deal_id || null,
      summary: `تم جدولة متابعة جديدة: ${validated.action}`,
      notes: validated.notes || null,
      metadata: { follow_up_id: inserted.id },
    });

    revalidatePath("/follow-ups");
    revalidatePath(`/clients/${validated.client_id}`);
    if (validated.deal_id) {
      revalidatePath(`/deals/${validated.deal_id}`);
    }

    return { success: true, data: inserted as unknown as FollowUp };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create follow-up") };
  }
}

/**
 * Complete a follow-up and optionally schedule the next step
 */
export async function completeFollowUp(
  input: CompleteFollowUpInput
): Promise<ActionResult<{ completed: FollowUp; nextFollowUp?: FollowUp }>> {
  try {
    const validated = completeFollowUpSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const flw = demoFollowUps.find((f) => f.id === validated.follow_up_id);
      if (!flw) return { success: false, error: "Follow-up not found" };

      flw.status = "COMPLETED";
      flw.completion_result = validated.completion_result;
      flw.completed_at = new Date().toISOString();
      flw.updated_at = new Date().toISOString();

      let nextFollowUp: FollowUp | undefined;
      if (validated.schedule_next && validated.next_action && validated.next_due_at) {
        nextFollowUp = {
          id: `flw-${Date.now().toString().slice(-4)}`,
          client_id: flw.client_id,
          deal_id: flw.deal_id,
          responsible_id: flw.responsible_id,
          due_at: validated.next_due_at,
          action: validated.next_action,
          notes: validated.next_notes || null,
          status: "PENDING",
          completion_result: null,
          completed_at: null,
          created_by: flw.responsible_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        demoFollowUps.unshift(nextFollowUp);
      }

      revalidatePath("/follow-ups");
      return { success: true, data: { completed: flw, nextFollowUp } };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const completedAt = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("follow_ups")
      .update({
        status: "COMPLETED",
        completion_result: validated.completion_result,
        completed_at: completedAt,
      })
      .eq("id", validated.follow_up_id)
      .select()
      .single();

    if (updateError || !updated) {
      return { success: false, error: updateError?.message || "Failed to complete follow-up" };
    }

    await supabase.from("activities").insert({
      type: "FOLLOW_UP",
      actor_id: user.id,
      client_id: updated.client_id,
      deal_id: updated.deal_id,
      summary: `تم إنجاز المتابعة: ${updated.action}`,
      notes: validated.completion_result,
      metadata: { follow_up_id: updated.id },
    });

    let nextFollowUp: FollowUp | undefined;
    if (validated.schedule_next && validated.next_action && validated.next_due_at) {
      const { data: nextInserted } = await supabase
        .from("follow_ups")
        .insert({
          client_id: updated.client_id,
          deal_id: updated.deal_id,
          responsible_id: user.id,
          due_at: validated.next_due_at,
          action: validated.next_action,
          notes: validated.next_notes || null,
          status: "PENDING",
          created_by: user.id,
        })
        .select()
        .single();

      if (nextInserted) {
        nextFollowUp = nextInserted as unknown as FollowUp;
        await supabase.from("activities").insert({
          type: "FOLLOW_UP",
          actor_id: user.id,
          client_id: updated.client_id,
          deal_id: updated.deal_id,
          summary: `جدولة الخطوة التالية: ${validated.next_action}`,
          notes: validated.next_notes || null,
          metadata: { follow_up_id: nextInserted.id },
        });
      }
    }

    revalidatePath("/follow-ups");
    revalidatePath(`/clients/${updated.client_id}`);
    if (updated.deal_id) {
      revalidatePath(`/deals/${updated.deal_id}`);
    }

    return {
      success: true,
      data: {
        completed: updated as unknown as FollowUp,
        nextFollowUp,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to complete follow-up") };
  }
}

/**
 * Reschedule a follow-up to a new date
 */
export async function rescheduleFollowUp(
  input: RescheduleFollowUpInput
): Promise<ActionResult<FollowUp>> {
  try {
    const validated = rescheduleFollowUpSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const flw = demoFollowUps.find((f) => f.id === validated.follow_up_id);
      if (!flw) return { success: false, error: "Follow-up not found" };

      flw.due_at = validated.new_due_at;
      if (validated.reason) {
        flw.notes = `${flw.notes ? flw.notes + "\n" : ""}[تأجيل]: ${validated.reason}`;
      }
      flw.updated_at = new Date().toISOString();
      revalidatePath("/follow-ups");
      return { success: true, data: flw };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current } = await supabase
      .from("follow_ups")
      .select("notes, client_id, deal_id, action")
      .eq("id", validated.follow_up_id)
      .single();

    const updatedNotes = validated.reason
      ? `${current?.notes ? current.notes + "\n" : ""}[تأجيل]: ${validated.reason}`
      : current?.notes;

    const { data: updated, error: updateError } = await supabase
      .from("follow_ups")
      .update({
        due_at: validated.new_due_at,
        notes: updatedNotes,
      })
      .eq("id", validated.follow_up_id)
      .select()
      .single();

    if (updateError || !updated) {
      return { success: false, error: updateError?.message || "Failed to reschedule follow-up" };
    }

    await supabase.from("activities").insert({
      type: "FOLLOW_UP",
      actor_id: user.id,
      client_id: updated.client_id,
      deal_id: updated.deal_id,
      summary: `تأجيل المتابعة إلى: ${validated.new_due_at}`,
      notes: validated.reason || null,
      metadata: { follow_up_id: updated.id },
    });

    revalidatePath("/follow-ups");

    return { success: true, data: updated as unknown as FollowUp };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to reschedule follow-up") };
  }
}
