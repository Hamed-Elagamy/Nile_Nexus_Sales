"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  filterDealsSchema,
  type CreateDealInput,
  type UpdateDealInput,
  type UpdateDealStageInput,
  type FilterDealsInput,
  type DealStage,
} from "@/lib/schemas/deal";
import type { Deal, Client, Activity } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface DealWithRelations extends Deal {
  client?: Pick<Client, "id" | "name" | "business_id" | "phone" | "type"> | null;
  sales_owner?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  deal_services?: Array<{
    id: string;
    service_id: string;
    service?: { name_ar: string; name_en: string } | null;
  }>;
}

export interface PaginatedDealsResult {
  items: DealWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PipelineStageSummary {
  stage: DealStage;
  deals: DealWithRelations[];
  totalValue: number;
  count: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * Fetch paginated deals with search and stage filters
 */
export async function getDeals(
  filters: Partial<FilterDealsInput> = {}
): Promise<ActionResult<PaginatedDealsResult>> {
  try {
    const parsed = filterDealsSchema.parse(filters);
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("deals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, type),
        sales_owner:profiles!sales_owner_id(id, full_name, email)
      `,
        { count: "exact" }
      )
      .is("archived_at", null);

    if (parsed.stage) {
      query = query.eq("stage", parsed.stage);
    }

    if (parsed.client_id) {
      query = query.eq("client_id", parsed.client_id);
    }

    if (parsed.sales_owner_id) {
      query = query.eq("sales_owner_id", parsed.sales_owner_id);
    }

    if (parsed.query && parsed.query.trim()) {
      const q = parsed.query.trim();
      query = query.or(`title.ilike.%${q}%,business_id.ilike.%${q}%`);
    }

    const from = (parsed.page - 1) * parsed.pageSize;
    const to = from + parsed.pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const items = (data || []) as unknown as DealWithRelations[];
    const total = count || 0;
    const totalPages = Math.ceil(total / parsed.pageSize) || 1;

    return {
      success: true,
      data: {
        items,
        total,
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load deals") };
  }
}

/**
 * Fetch all deals organized for Pipeline Kanban board
 */
export async function getPipelineDeals(): Promise<
  ActionResult<Record<DealStage, PipelineStageSummary>>
> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, type),
        sales_owner:profiles!sales_owner_id(id, full_name, email)
      `
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const deals = (data || []) as unknown as DealWithRelations[];

    const stages: DealStage[] = [
      "NEW",
      "CONTACTED",
      "INTERESTED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "WON",
      "LOST",
      "LATER",
    ];

    const result = {} as Record<DealStage, PipelineStageSummary>;

    for (const stage of stages) {
      const stageDeals = deals.filter((d) => d.stage === stage);
      const totalValue = stageDeals.reduce(
        (sum, d) => sum + (Number(d.estimated_value) || 0),
        0
      );
      result[stage] = {
        stage,
        deals: stageDeals,
        totalValue,
        count: stageDeals.length,
      };
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load pipeline") };
  }
}

/**
 * Get single deal by ID with activities and client info
 */
export async function getDealById(
  id: string
): Promise<ActionResult<DealWithRelations & { activities?: Activity[] }>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, email, type, area),
        sales_owner:profiles!sales_owner_id(id, full_name, email)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Deal not found" };
    }

    // Fetch activities for this deal
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("deal_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      success: true,
      data: {
        ...(data as unknown as DealWithRelations),
        activities: (activities || []) as Activity[],
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to fetch deal") };
  }
}

/**
 * Create a new Deal record
 */
export async function createDeal(
  input: CreateDealInput
): Promise<ActionResult<DealWithRelations>> {
  try {
    const validated = createDealSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    let businessId = `DEAL-${Date.now().toString().slice(-5)}`;
    try {
      const { data: rpcId } = await supabase.rpc("generate_business_id", {
        p_entity_type: "deal",
      });
      if (rpcId) businessId = rpcId;
    } catch {
      // fallback
    }

    const salesOwnerId = validated.sales_owner_id || user.id;

    const { data: inserted, error: insertError } = await supabase
      .from("deals")
      .insert({
        business_id: businessId,
        title: validated.title,
        client_id: validated.client_id,
        sales_owner_id: salesOwnerId,
        stage: validated.stage,
        estimated_value: validated.estimated_value || null,
        currency: validated.currency || "EGP",
        notes: validated.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || "Failed to create deal" };
    }

    // Link services if any
    if (validated.service_ids && validated.service_ids.length > 0) {
      const serviceRows = validated.service_ids.map((service_id) => ({
        deal_id: inserted.id,
        service_id,
      }));
      await supabase.from("deal_services").insert(serviceRows);
    }

    // Log Activity
    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      client_id: validated.client_id,
      deal_id: inserted.id,
      summary: `إنشاء صفقة جديدة: ${inserted.title} (${inserted.business_id})`,
      metadata: { deal_id: inserted.id },
    });

    revalidatePath("/deals");
    revalidatePath("/pipeline");
    revalidatePath(`/clients/${validated.client_id}`);

    return {
      success: true,
      data: inserted as unknown as DealWithRelations,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create deal") };
  }
}

/**
 * Update Deal stage (e.g. dragging across Pipeline Kanban)
 */
export async function updateDealStage(
  input: UpdateDealStageInput
): Promise<ActionResult> {
  try {
    const validated = updateDealStageSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current, error: currentErr } = await supabase
      .from("deals")
      .select("id, title, stage, client_id, business_id")
      .eq("id", validated.deal_id)
      .single();

    if (currentErr || !current) {
      return { success: false, error: "Deal not found" };
    }

    const updatePayload: Record<string, unknown> = {
      stage: validated.stage,
      updated_by: user.id,
    };

    if (validated.stage === "WON") {
      updatePayload.won_date = new Date().toISOString().split("T")[0];
      if (validated.final_value) updatePayload.final_value = validated.final_value;
    }

    if (validated.stage === "LOST") {
      if (validated.lost_reason_id) updatePayload.lost_reason_id = validated.lost_reason_id;
      if (validated.lost_notes) updatePayload.lost_notes = validated.lost_notes;
      if (validated.resurface_date) updatePayload.resurface_date = validated.resurface_date;
    }

    const { error: updateErr } = await supabase
      .from("deals")
      .update(updatePayload)
      .eq("id", validated.deal_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Log Activity
    await supabase.from("activities").insert({
      type: "STAGE_CHANGE",
      actor_id: user.id,
      client_id: current.client_id,
      deal_id: current.id,
      summary: `تغيير مرحلة الصفقة ${current.title} من ${current.stage} إلى ${validated.stage}`,
      notes: validated.notes || validated.lost_notes || null,
      metadata: {
        previous_stage: current.stage,
        new_stage: validated.stage,
      },
    });

    revalidatePath("/deals");
    revalidatePath("/pipeline");
    revalidatePath(`/deals/${validated.deal_id}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update deal stage") };
  }
}

/**
 * Update Deal details
 */
export async function updateDeal(
  dealId: string,
  input: UpdateDealInput
): Promise<ActionResult<DealWithRelations>> {
  try {
    const validated = updateDealSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current, error: currentErr } = await supabase
      .from("deals")
      .select("id, title, client_id, business_id")
      .eq("id", dealId)
      .single();

    if (currentErr || !current) {
      return { success: false, error: "Deal not found" };
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: user.id,
    };

    if (validated.title !== undefined) updatePayload.title = validated.title;
    if (validated.sales_owner_id !== undefined) updatePayload.sales_owner_id = validated.sales_owner_id;
    if (validated.stage !== undefined) updatePayload.stage = validated.stage;
    if (validated.estimated_value !== undefined) updatePayload.estimated_value = validated.estimated_value;
    if (validated.final_value !== undefined) updatePayload.final_value = validated.final_value;
    if (validated.currency !== undefined) updatePayload.currency = validated.currency;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;
    if (validated.won_date !== undefined) updatePayload.won_date = validated.won_date;
    if (validated.lost_reason_id !== undefined) updatePayload.lost_reason_id = validated.lost_reason_id;
    if (validated.lost_notes !== undefined) updatePayload.lost_notes = validated.lost_notes;
    if (validated.resurface_date !== undefined) updatePayload.resurface_date = validated.resurface_date;

    const { data: updated, error: updateErr } = await supabase
      .from("deals")
      .update(updatePayload)
      .eq("id", dealId)
      .select()
      .single();

    if (updateErr || !updated) {
      return { success: false, error: updateErr?.message || "Failed to update deal" };
    }

    // Sync services if provided
    if (validated.service_ids) {
      await supabase.from("deal_services").delete().eq("deal_id", dealId);
      if (validated.service_ids.length > 0) {
        const rows = validated.service_ids.map((service_id) => ({
          deal_id: dealId,
          service_id,
        }));
        await supabase.from("deal_services").insert(rows);
      }
    }

    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      client_id: current.client_id,
      deal_id: dealId,
      summary: `تحديث بيانات الصفقة: ${current.title}`,
      metadata: { deal_id: dealId },
    });

    revalidatePath("/deals");
    revalidatePath("/pipeline");
    revalidatePath(`/deals/${dealId}`);

    return {
      success: true,
      data: updated as unknown as DealWithRelations,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update deal") };
  }
}

