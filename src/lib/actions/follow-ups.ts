"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createFollowUpSchema,
  completeFollowUpSchema,
  rescheduleFollowUpSchema,
  filterFollowUpsSchema,
  type CreateFollowUpInput,
  type CompleteFollowUpInput,
  type RescheduleFollowUpInput,
  type FilterFollowUpsInput,
  type FollowUpStatus,
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
    const supabase = await createSupabaseServerClient();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    // Query for tab counts in parallel
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

    // Build the query for the selected tab
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

    const from = (parsed.page - 1) * parsed.pageSize;
    const to = from + parsed.pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) {
      return { success: false, error: error.message };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / parsed.pageSize) || 1;

    return {
      success: true,
      data: {
        items: (data || []) as unknown as FollowUpWithRelations[],
        counts,
        total,
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load follow-ups") };
  }
}

/**
 * Create a new Follow-up
 */
export async function createFollowUp(
  input: CreateFollowUpInput
): Promise<ActionResult<FollowUpWithRelations>> {
  try {
    const validated = createFollowUpSchema.parse(input);
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
        status: "PENDING" as FollowUpStatus,
        created_by: user.id,
      })
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, type),
        deal:deals!deal_id(id, title, business_id, estimated_value, stage),
        responsible:profiles!responsible_id(id, full_name, email)
      `
      )
      .single();

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || "Failed to create follow-up" };
    }

    // Activity log
    await supabase.from("activities").insert({
      type: validated.action === "CALL" ? "CALL" : validated.action === "MEETING" ? "MEETING" : "NOTE",
      actor_id: user.id,
      client_id: validated.client_id,
      deal_id: validated.deal_id || null,
      summary: `جدولة متابعة (${validated.action}) للموعد ${new Date(validated.due_at).toLocaleDateString("ar-EG")}`,
      notes: validated.notes || null,
      metadata: { follow_up_id: inserted.id },
    });

    revalidatePath("/follow-ups");
    revalidatePath(`/clients/${validated.client_id}`);
    if (validated.deal_id) {
      revalidatePath(`/deals/${validated.deal_id}`);
    }

    return {
      success: true,
      data: inserted as unknown as FollowUpWithRelations,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create follow-up") };
  }
}

/**
 * Complete a Follow-up and optionally schedule the next one in one workflow
 */
export async function completeFollowUp(
  input: CompleteFollowUpInput
): Promise<ActionResult> {
  try {
    const validated = completeFollowUpSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current, error: currentErr } = await supabase
      .from("follow_ups")
      .select("id, client_id, deal_id, action, responsible_id")
      .eq("id", validated.follow_up_id)
      .single();

    if (currentErr || !current) {
      return { success: false, error: "Follow-up not found" };
    }

    // Mark current as completed
    const { error: updateErr } = await supabase
      .from("follow_ups")
      .update({
        status: "COMPLETED",
        completion_result: validated.completion_result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", validated.follow_up_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Log completion activity
    await supabase.from("activities").insert({
      type: "NOTE",
      actor_id: user.id,
      client_id: current.client_id,
      deal_id: current.deal_id,
      summary: `تم إتمام المتابعة (${current.action})`,
      notes: validated.completion_result,
      metadata: {
        completed_follow_up_id: current.id,
      },
    });

    // Optionally schedule next follow-up
    if (validated.schedule_next && validated.next_due_at && validated.next_action) {
      await supabase.from("follow_ups").insert({
        client_id: current.client_id,
        deal_id: current.deal_id,
        responsible_id: current.responsible_id,
        due_at: validated.next_due_at,
        action: validated.next_action,
        notes: validated.next_notes || null,
        status: "PENDING",
        created_by: user.id,
      });

      await supabase.from("activities").insert({
        type: "NOTE",
        actor_id: user.id,
        client_id: current.client_id,
        deal_id: current.deal_id,
        summary: `تمت جدولة المتابعة القادمة (${validated.next_action})`,
        notes: validated.next_notes || null,
      });
    }

    revalidatePath("/follow-ups");
    revalidatePath(`/clients/${current.client_id}`);
    if (current.deal_id) {
      revalidatePath(`/deals/${current.deal_id}`);
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to complete follow-up") };
  }
}

/**
 * Reschedule a Follow-up
 */
export async function rescheduleFollowUp(
  input: RescheduleFollowUpInput
): Promise<ActionResult> {
  try {
    const validated = rescheduleFollowUpSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current, error: currentErr } = await supabase
      .from("follow_ups")
      .select("id, client_id, deal_id, action, due_at")
      .eq("id", validated.follow_up_id)
      .single();

    if (currentErr || !current) {
      return { success: false, error: "Follow-up not found" };
    }

    const { error: updateErr } = await supabase
      .from("follow_ups")
      .update({
        due_at: validated.new_due_at,
        status: "PENDING",
        notes: validated.reason ? `تم التأجيل: ${validated.reason}` : undefined,
      })
      .eq("id", validated.follow_up_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    await supabase.from("activities").insert({
      type: "NOTE",
      actor_id: user.id,
      client_id: current.client_id,
      deal_id: current.deal_id,
      summary: `تأجيل موعد المتابعة إلى ${new Date(validated.new_due_at).toLocaleDateString("ar-EG")}`,
      notes: validated.reason || null,
      metadata: {
        previous_due_at: current.due_at,
        new_due_at: validated.new_due_at,
      },
    });

    revalidatePath("/follow-ups");
    revalidatePath(`/clients/${current.client_id}`);
    if (current.deal_id) {
      revalidatePath(`/deals/${current.deal_id}`);
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to reschedule follow-up") };
  }
}
