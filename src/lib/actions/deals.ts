"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  demoClients,
  demoDeals,
  demoProfiles,
} from "@/lib/demo-data";
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
import type { Deal, Client } from "@/types/domain";

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

    if (!isSupabaseConfigured()) {
      let filtered = [...demoDeals].filter((d) => d.archived_at === null);

      if (parsed.stage) {
        filtered = filtered.filter((d) => d.stage === parsed.stage);
      }

      if (parsed.client_id) {
        filtered = filtered.filter((d) => d.client_id === parsed.client_id);
      }

      if (parsed.sales_owner_id) {
        filtered = filtered.filter((d) => d.sales_owner_id === parsed.sales_owner_id);
      }

      if (parsed.query && parsed.query.trim()) {
        const q = parsed.query.trim().toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.business_id.toLowerCase().includes(q)
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / parsed.pageSize) || 1;
      const from = (parsed.page - 1) * parsed.pageSize;
      const sliced = filtered.slice(from, from + parsed.pageSize);

      const items: DealWithRelations[] = sliced.map((d) => {
        const client = demoClients.find((c) => c.id === d.client_id);
        const owner = demoProfiles.find((p) => p.id === d.sales_owner_id);
        return {
          ...d,
          client: client
            ? {
                id: client.id,
                name: client.name,
                business_id: client.business_id,
                phone: client.phone,
                type: client.type,
              }
            : null,
          sales_owner: owner ? { id: owner.id, full_name: owner.full_name, email: owner.email } : null,
        };
      });

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
    }

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
  const allStages: DealStage[] = [
    "NEW",
    "CONTACTED",
    "INTERESTED",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "WON",
    "LOST",
    "LATER",
  ];

  try {
    if (!isSupabaseConfigured()) {
      const result = {} as Record<DealStage, PipelineStageSummary>;
      for (const stage of allStages) {
        result[stage] = { stage, deals: [], totalValue: 0, count: 0 };
      }

      for (const d of demoDeals) {
        if (d.archived_at) continue;
        const client = demoClients.find((c) => c.id === d.client_id);
        const owner = demoProfiles.find((p) => p.id === d.sales_owner_id);
        const dealWithRel: DealWithRelations = {
          ...d,
          client: client
            ? {
                id: client.id,
                name: client.name,
                business_id: client.business_id,
                phone: client.phone,
                type: client.type,
              }
            : null,
          sales_owner: owner ? { id: owner.id, full_name: owner.full_name, email: owner.email } : null,
        };

        if (result[d.stage]) {
          result[d.stage].deals.push(dealWithRel);
          result[d.stage].count += 1;
          result[d.stage].totalValue += Number(d.final_value || d.estimated_value) || 0;
        }
      }

      return { success: true, data: result };
    }

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

    const result = {} as Record<DealStage, PipelineStageSummary>;
    for (const stage of allStages) {
      result[stage] = { stage, deals: [], totalValue: 0, count: 0 };
    }

    for (const deal of (data || []) as unknown as DealWithRelations[]) {
      const stage = deal.stage;
      if (result[stage]) {
        result[stage].deals.push(deal);
        result[stage].count += 1;
        result[stage].totalValue +=
          Number(deal.final_value || deal.estimated_value) || 0;
      }
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load pipeline deals") };
  }
}

/**
 * Get deal by ID with client details and relations
 */
export async function getDealById(id: string): Promise<ActionResult<DealWithRelations>> {
  try {
    if (!isSupabaseConfigured()) {
      const deal = demoDeals.find((d) => d.id === id);
      if (!deal) return { success: false, error: "Deal not found" };

      const client = demoClients.find((c) => c.id === deal.client_id);
      const owner = demoProfiles.find((p) => p.id === deal.sales_owner_id);

      return {
        success: true,
        data: {
          ...deal,
          client: client
            ? {
                id: client.id,
                name: client.name,
                business_id: client.business_id,
                phone: client.phone,
                type: client.type,
              }
            : null,
          sales_owner: owner ? { id: owner.id, full_name: owner.full_name, email: owner.email } : null,
        },
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        client:clients!client_id(id, name, business_id, phone, type, email, industry),
        sales_owner:profiles!sales_owner_id(id, full_name, email),
        deal_services(id, service_id, service:services(name_ar, name_en))
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Deal not found" };
    }

    return { success: true, data: data as unknown as DealWithRelations };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load deal") };
  }
}

/**
 * Create a new deal
 */
export async function createDeal(input: CreateDealInput): Promise<ActionResult<Deal>> {
  try {
    const validated = createDealSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const newDealId = `d-${Date.now().toString().slice(-4)}`;
      const businessId = `DEAL-00${300 + demoDeals.length + 1}`;
      const owner = demoProfiles.find((p) => p.id === validated.sales_owner_id) || demoProfiles[2];

      const newDeal: Deal = {
        id: newDealId,
        business_id: businessId,
        title: validated.title,
        client_id: validated.client_id,
        sales_owner_id: owner.id,
        stage: validated.stage || "NEW",
        estimated_value: validated.estimated_value ? String(validated.estimated_value) : null,
        currency: validated.currency || "EGP",
        final_value: null,
        lost_reason: null,
        lost_notes: null,
        resurface_date: null,
        won_date: null,
        notes: validated.notes || null,
        archived_at: null,
        created_by: owner.id,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      demoDeals.unshift(newDeal);
      revalidatePath("/deals");
      revalidatePath("/pipeline");

      return { success: true, data: newDeal };
    }

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
        stage: validated.stage || "NEW",
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

    if (validated.service_ids && validated.service_ids.length > 0) {
      const serviceRows = validated.service_ids.map((serviceId: string) => ({
        deal_id: inserted.id,
        service_id: serviceId,
      }));
      await supabase.from("deal_services").insert(serviceRows);
    }

    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      client_id: validated.client_id,
      deal_id: inserted.id,
      summary: `تسجيل صفقة جديدة: ${inserted.title} (${inserted.business_id})`,
      metadata: { deal_id: inserted.id },
    });

    revalidatePath("/deals");
    revalidatePath("/pipeline");

    return { success: true, data: inserted as unknown as Deal };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create deal") };
  }
}

/**
 * Update deal details
 */
export async function updateDeal(
  id: string,
  input: UpdateDealInput
): Promise<ActionResult<Deal>> {
  try {
    const validated = updateDealSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const deal = demoDeals.find((d) => d.id === id);
      if (!deal) return { success: false, error: "Deal not found" };

      if (validated.title !== undefined) deal.title = validated.title;
      if (validated.stage !== undefined) deal.stage = validated.stage;
      if (validated.estimated_value !== undefined)
        deal.estimated_value = validated.estimated_value ? String(validated.estimated_value) : null;
      if (validated.notes !== undefined) deal.notes = validated.notes;
      deal.updated_at = new Date().toISOString();

      revalidatePath("/deals");
      revalidatePath(`/deals/${id}`);
      revalidatePath("/pipeline");

      return { success: true, data: deal };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const updatePayload: Record<string, unknown> = {
      updated_by: user.id,
    };

    if (validated.title !== undefined) updatePayload.title = validated.title;
    if (validated.stage !== undefined) updatePayload.stage = validated.stage;
    if (validated.estimated_value !== undefined)
      updatePayload.estimated_value = validated.estimated_value;
    if (validated.currency !== undefined) updatePayload.currency = validated.currency;
    if (validated.sales_owner_id !== undefined)
      updatePayload.sales_owner_id = validated.sales_owner_id;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;

    const { data: updated, error } = await supabase
      .from("deals")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return { success: false, error: error?.message || "Failed to update deal" };
    }

    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
    revalidatePath("/pipeline");

    return { success: true, data: updated as unknown as Deal };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update deal") };
  }
}

/**
 * Move deal through stages
 */
export async function updateDealStage(
  input: UpdateDealStageInput
): Promise<ActionResult> {
  try {
    const validated = updateDealStageSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const deal = demoDeals.find((d) => d.id === validated.deal_id);
      if (!deal) return { success: false, error: "Deal not found" };

      deal.stage = validated.stage;
      if (validated.stage === "WON") {
        deal.won_date = new Date().toISOString();
        if (validated.final_value != null) deal.final_value = String(validated.final_value);
      } else if (validated.stage === "LOST") {
        deal.lost_reason = validated.lost_reason_id || null;
        deal.lost_notes = validated.lost_notes || null;
      }
      deal.updated_at = new Date().toISOString();

      revalidatePath("/deals");
      revalidatePath("/pipeline");
      revalidatePath(`/deals/${validated.deal_id}`);

      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const updatePayload: Record<string, unknown> = {
      stage: validated.stage,
      updated_by: user.id,
    };

    if (validated.stage === "WON") {
      updatePayload.won_date = new Date().toISOString();
      if (validated.final_value !== undefined) {
        updatePayload.final_value = validated.final_value;
      }
    } else if (validated.stage === "LOST") {
      updatePayload.lost_reason_id = validated.lost_reason_id || null;
      updatePayload.lost_notes = validated.lost_notes || null;
      if (validated.resurface_date) {
        updatePayload.resurface_date = validated.resurface_date;
      }
    }

    const { error } = await supabase
      .from("deals")
      .update(updatePayload)
      .eq("id", validated.deal_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/deals");
    revalidatePath("/pipeline");
    revalidatePath(`/deals/${validated.deal_id}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to change deal stage") };
  }
}
