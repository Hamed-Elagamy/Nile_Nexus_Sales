"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createPotentialClientSchema,
  updatePotentialClientSchema,
  updateStatusSchema,
  filterPotentialClientSchema,
  normalizePhoneNumber,
  type CreatePotentialClientInput,
  type UpdatePotentialClientInput,
  type FilterPotentialClientInput,
  type PotentialClientStatusType,
} from "@/lib/schemas/potential-client";
import type { PotentialClient, OpportunityIndicator } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface PotentialClientWithRelations extends Omit<PotentialClient, "source"> {
  opportunities: OpportunityIndicator[];
  research_owner?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  source?: {
    id: string;
    name_ar: string;
    name_en: string;
  } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface RawQueryRow extends Omit<PotentialClient, "source"> {
  opportunities?: Array<{ indicator: OpportunityIndicator }>;
  research_owner?: { id: string; full_name: string; email: string } | null;
  source?: { id: string; name_ar: string; name_en: string } | null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * Check if a client or potential client already exists with similar phone or name
 */
export async function checkDuplicatePotentialClient(params: {
  phone?: string | null;
  name?: string | null;
}): Promise<{
  isDuplicate: boolean;
  matches: Array<{ id: string; name: string; business_id: string; type: "potential_client" | "client" }>;
}> {
  const supabase = await createClient();
  const normalizedPhone = normalizePhoneNumber(params.phone);
  const nameQuery = params.name?.trim();

  const matches: Array<{
    id: string;
    name: string;
    business_id: string;
    type: "potential_client" | "client";
  }> = [];

  if (normalizedPhone) {
    // Check potential clients
    const { data: pcPhone } = await supabase
      .from("potential_clients")
      .select("id, name, business_id")
      .eq("phone_normalized", normalizedPhone)
      .limit(3);

    if (pcPhone) {
      for (const m of pcPhone) {
        matches.push({ id: m.id, name: m.name, business_id: m.business_id, type: "potential_client" });
      }
    }

    // Check confirmed clients
    const { data: cPhone } = await supabase
      .from("clients")
      .select("id, name, business_id")
      .eq("phone_normalized", normalizedPhone)
      .limit(3);

    if (cPhone) {
      for (const m of cPhone) {
        matches.push({ id: m.id, name: m.name, business_id: m.business_id, type: "client" });
      }
    }
  }

  if (nameQuery && nameQuery.length >= 3) {
    const { data: pcName } = await supabase
      .from("potential_clients")
      .select("id, name, business_id")
      .ilike("name", `%${nameQuery}%`)
      .limit(3);

    if (pcName) {
      for (const m of pcName) {
        if (!matches.some((existing) => existing.id === m.id)) {
          matches.push({ id: m.id, name: m.name, business_id: m.business_id, type: "potential_client" });
        }
      }
    }
  }

  return {
    isDuplicate: matches.length > 0,
    matches,
  };
}

/**
 * Fetch paginated potential clients with filters and search
 */
export async function getPotentialClients(
  filters: Partial<FilterPotentialClientInput> = {}
): Promise<ActionResult<PaginatedResult<PotentialClientWithRelations>>> {
  try {
    const parsedFilters = filterPotentialClientSchema.parse(filters);
    const supabase = await createClient();

    let query = supabase
      .from("potential_clients")
      .select(
        `
        *,
        research_owner:profiles!research_owner_id(id, full_name, email),
        source:lead_sources(id, name_ar, name_en),
        opportunities:potential_client_opportunities(indicator)
      `,
        { count: "exact" }
      )
      .is("archived_at", null);

    if (parsedFilters.status) {
      query = query.eq("status", parsedFilters.status);
    }

    if (parsedFilters.research_owner_id) {
      query = query.eq("research_owner_id", parsedFilters.research_owner_id);
    }

    if (parsedFilters.query && parsedFilters.query.trim()) {
      const q = parsedFilters.query.trim();
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,business_id.ilike.%${q}%`);
    }

    const from = (parsedFilters.page - 1) * parsedFilters.pageSize;
    const to = from + parsedFilters.pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const rawRows = (data || []) as unknown as RawQueryRow[];
    const items: PotentialClientWithRelations[] = rawRows.map((row) => ({
      ...row,
      opportunities: (row.opportunities || []).map((o) => o.indicator),
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / parsedFilters.pageSize) || 1;

    return {
      success: true,
      data: {
        items,
        total,
        page: parsedFilters.page,
        pageSize: parsedFilters.pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load potential clients") };
  }
}

/**
 * Get single potential client by ID with opportunities & activities
 */
export async function getPotentialClientById(
  id: string
): Promise<ActionResult<PotentialClientWithRelations>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("potential_clients")
      .select(
        `
        *,
        research_owner:profiles!research_owner_id(id, full_name, email),
        source:lead_sources(id, name_ar, name_en),
        opportunities:potential_client_opportunities(indicator, notes)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Potential client not found" };
    }

    const row = data as unknown as RawQueryRow;
    const formatted: PotentialClientWithRelations = {
      ...row,
      opportunities: (row.opportunities || []).map((o) => o.indicator),
    };

    return { success: true, data: formatted };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Error fetching potential client") };
  }
}

/**
 * Create a new potential client record with concurrency-safe business ID
 */
export async function createPotentialClient(
  input: CreatePotentialClientInput
): Promise<ActionResult<PotentialClientWithRelations>> {
  try {
    const validated = createPotentialClientSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Duplicate check warning
    const duplicate = await checkDuplicatePotentialClient({
      phone: validated.phone,
      name: validated.name,
    });

    let businessId: string = `PC-${Date.now().toString().slice(-5)}`;
    try {
      const { data: rpcId } = await supabase.rpc("generate_business_id", {
        p_entity_type: "potential_client",
      });
      if (rpcId) {
        businessId = rpcId;
      }
    } catch {
      // fallback to generated business ID
    }

    const phoneNormalized = normalizePhoneNumber(validated.phone);
    const researchOwnerId = validated.research_owner_id || user.id;

    const { data: inserted, error: insertError } = await supabase
      .from("potential_clients")
      .insert({
        business_id: businessId,
        name: validated.name,
        area: validated.area || null,
        phone: validated.phone || null,
        phone_normalized: phoneNormalized,
        website: validated.website || null,
        instagram: validated.instagram || null,
        facebook: validated.facebook || null,
        source_id: validated.source_id || null,
        research_owner_id: researchOwnerId,
        status: "NEW",
        notes: validated.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || "Failed to create potential client" };
    }

    // Insert opportunity indicators if any
    if (validated.opportunities && validated.opportunities.length > 0) {
      const oppRows = validated.opportunities.map((indicator) => ({
        potential_client_id: inserted.id,
        indicator,
      }));
      await supabase.from("potential_client_opportunities").insert(oppRows);
    }

    // Create system activity
    await supabase.from("activities").insert({
      type: "SYSTEM",
      actor_id: user.id,
      summary: `تسجيل عميل محتمل جديد: ${inserted.name} (${inserted.business_id})`,
      notes: validated.notes || null,
      metadata: { potential_client_id: inserted.id },
    });

    revalidatePath("/potential-clients");

    return {
      success: true,
      data: {
        ...inserted,
        opportunities: validated.opportunities || [],
      },
      warning: duplicate.isDuplicate
        ? "العميل ده موجود عندنا بالفعل تقريبًا 👀"
        : undefined,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create potential client") };
  }
}

/**
 * Update potential client details and opportunity indicators
 */
export async function updatePotentialClient(
  id: string,
  input: UpdatePotentialClientInput
): Promise<ActionResult<PotentialClientWithRelations>> {
  try {
    const validated = updatePotentialClientSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const updatePayload: Record<string, unknown> = {};
    if (validated.name !== undefined) updatePayload.name = validated.name;
    if (validated.area !== undefined) updatePayload.area = validated.area;
    if (validated.phone !== undefined) {
      updatePayload.phone = validated.phone;
      updatePayload.phone_normalized = normalizePhoneNumber(validated.phone);
    }
    if (validated.website !== undefined) updatePayload.website = validated.website;
    if (validated.instagram !== undefined) updatePayload.instagram = validated.instagram;
    if (validated.facebook !== undefined) updatePayload.facebook = validated.facebook;
    if (validated.source_id !== undefined) updatePayload.source_id = validated.source_id;
    if (validated.research_owner_id !== undefined) updatePayload.research_owner_id = validated.research_owner_id;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;
    if (validated.status !== undefined) updatePayload.status = validated.status;

    const { data: updated, error: updateError } = await supabase
      .from("potential_clients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return { success: false, error: updateError?.message || "Failed to update potential client" };
    }

    // Sync opportunities if passed
    if (validated.opportunities !== undefined) {
      await supabase.from("potential_client_opportunities").delete().eq("potential_client_id", id);
      if (validated.opportunities.length > 0) {
        const oppRows = validated.opportunities.map((indicator) => ({
          potential_client_id: id,
          indicator,
        }));
        await supabase.from("potential_client_opportunities").insert(oppRows);
      }
    }

    revalidatePath("/potential-clients");
    revalidatePath(`/potential-clients/${id}`);

    return {
      success: true,
      data: {
        ...updated,
        opportunities: validated.opportunities || [],
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update potential client") };
  }
}

/**
 * Update research status (NEW -> RESEARCHING -> RESEARCHED -> ARCHIVED)
 */
export async function updatePotentialClientStatus(
  id: string,
  status: PotentialClientStatusType,
  notes?: string
): Promise<ActionResult> {
  try {
    const validated = updateStatusSchema.parse({ status, notes });
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: current, error: fetchErr } = await supabase
      .from("potential_clients")
      .select("status, name, business_id")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      return { success: false, error: "Potential client not found" };
    }

    const { error: updateErr } = await supabase
      .from("potential_clients")
      .update({
        status: validated.status,
        ...(validated.notes ? { notes: validated.notes } : {}),
      })
      .eq("id", id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Record activity
    await supabase.from("activities").insert({
      type: "STAGE_CHANGE",
      actor_id: user.id,
      summary: `تحديث حالة العميل المحتمل ${current.name} إلى: ${validated.status}`,
      notes: validated.notes || null,
      metadata: {
        potential_client_id: id,
        previous_status: current.status,
        new_status: validated.status,
      },
    });

    revalidatePath("/potential-clients");
    revalidatePath(`/potential-clients/${id}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update status") };
  }
}
