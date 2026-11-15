"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createNexaLeadSchema,
  updateNexaLeadStatusSchema,
  type CreateNexaLeadInput,
  type UpdateNexaLeadStatusInput,
} from "@/lib/schemas/nexa";
import { normalizePhoneNumber } from "@/lib/schemas/potential-client";
import type {
  NexaLead,
  NexaFilterParams,
  NexaMetrics,
  NexaLeadStatus,
} from "@/types/nexa";
import { broadcastNotification } from "@/lib/actions/notifications";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

// In-memory store for demo / offline fallback
const demoNexaLeadsStore: NexaLead[] = [];

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    if ("message" in err && typeof (err as any).message === "string") {
      return (err as any).message;
    }
  }
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * Create a new Nexa Sales Lead
 */
export async function createNexaLead(
  input: CreateNexaLeadInput
): Promise<ActionResult<NexaLead>> {
  try {
    const validated = createNexaLeadSchema.parse(input);
    const phoneNorm = normalizePhoneNumber(validated.phone) || validated.phone;

    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const newId = `nxa-${Date.now()}`;
      const businessId = `NXA-${String(demoNexaLeadsStore.length + 1).padStart(5, "0")}`;

      const lead: NexaLead = {
        id: newId,
        business_id: businessId,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        phone: validated.phone,
        phone_normalized: phoneNorm,
        alternative_phone: validated.alternative_phone || null,
        email: validated.email || null,
        store_url: validated.store_url || null,
        city: validated.city,
        area: validated.area,
        address: validated.address || null,
        gps_latitude: validated.gps_latitude || null,
        gps_longitude: validated.gps_longitude || null,
        gps_maps_url: validated.gps_maps_url || null,
        vertical_type: validated.vertical_type,
        commerce_model: validated.commerce_model,
        current_system: validated.current_system,
        monthly_order_volume: validated.monthly_order_volume || null,
        branches_count: validated.branches_count,
        plan_interest: validated.plan_interest,
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget ?? 0,
        next_action: validated.next_action || null,
        next_action_date: validated.next_action_date || null,
        notes: validated.notes || null,
        sales_rep_id: "demo-user-id",
        sales_rep_name: "Demo Sales Representative",
        status: "NEW",
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      demoNexaLeadsStore.unshift(lead);
      revalidatePath("/nexa");
      revalidatePath("/dashboard");
      return { success: true, data: lead };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Resolve sales rep / actor profile ID
    let salesRepId = user?.id;
    if (!salesRepId) {
      const { data: defaultProfile } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      salesRepId = defaultProfile?.id;
    }

    // Generate business ID
    const countRes = await supabase
      .from("nexa_leads")
      .select("id", { count: "exact", head: true });

    let nextNumber = 1;
    if (countRes && typeof countRes.count === "number") {
      nextNumber = countRes.count + 1;
    }
    const businessId = `NXA-${String(nextNumber).padStart(5, "0")}`;

    let insertedLead: NexaLead | null = null;
    let tableError: string | null = null;

    // 1. Attempt insert into dedicated nexa_leads table
    try {
      const { data: inserted, error: insertError } = await supabase
        .from("nexa_leads")
        .insert({
          business_id: businessId,
          brand_name: validated.brand_name,
          contact_name: validated.contact_name,
          contact_role: validated.contact_role,
          phone: validated.phone,
          phone_normalized: phoneNorm,
          alternative_phone: validated.alternative_phone || null,
          email: validated.email || null,
          store_url: validated.store_url || null,
          city: validated.city,
          area: validated.area,
          address: validated.address || null,
          gps_latitude: validated.gps_latitude || null,
          gps_longitude: validated.gps_longitude || null,
          gps_maps_url: validated.gps_maps_url || null,
          vertical_type: validated.vertical_type,
          commerce_model: validated.commerce_model,
          current_system: validated.current_system,
          monthly_order_volume: validated.monthly_order_volume || null,
          branches_count: validated.branches_count,
          plan_interest: validated.plan_interest,
          interest_level: validated.interest_level,
          estimated_budget: validated.estimated_budget ?? 0,
          next_action: validated.next_action || null,
          next_action_date: validated.next_action_date || null,
          notes: validated.notes || null,
          sales_rep_id: salesRepId || null,
          sales_rep_name: user?.user_metadata?.full_name || user?.email || null,
          status: "NEW",
        })
        .select()
        .single();

      if (inserted && !insertError) {
        insertedLead = inserted as NexaLead;
      } else if (insertError) {
        tableError = insertError.message;
      }
    } catch (err: unknown) {
      tableError = getErrorMessage(err, "Table insert failed");
    }

    // 2. Graceful fallback to potential_clients if table migration 013 is not yet run
    if (!insertedLead) {
      console.warn(
        "[Nexa Leads] Table nexa_leads not found in DB, falling back to potential_clients with [NEXA_LEAD] tag"
      );

      const countFallback = await supabase
        .from("potential_clients")
        .select("id", { count: "exact", head: true });
      const fallbackBusinessId = `NXA-PC-${String(
        (countFallback.count || 0) + 1
      ).padStart(5, "0")}`;

      const nexaMeta = {
        is_nexa: true,
        business_id: fallbackBusinessId,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        vertical_type: validated.vertical_type,
        commerce_model: validated.commerce_model,
        current_system: validated.current_system,
        monthly_order_volume: validated.monthly_order_volume,
        branches_count: validated.branches_count,
        plan_interest: validated.plan_interest,
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget,
        city: validated.city,
        area: validated.area,
        address: validated.address,
        gps_latitude: validated.gps_latitude,
        gps_longitude: validated.gps_longitude,
        gps_maps_url: validated.gps_maps_url,
        next_action: validated.next_action,
        next_action_date: validated.next_action_date,
        store_url: validated.store_url,
        alternative_phone: validated.alternative_phone,
        email: validated.email,
        notes: validated.notes,
        status: "NEW",
      };

      const fullNotes = `[NEXA_LEAD] ${validated.notes || ""}\n__NEXA_DATA__:${JSON.stringify(nexaMeta)}`;

      const { data: pcInserted, error: pcError } = await supabase
        .from("potential_clients")
        .insert({
          business_id: fallbackBusinessId,
          name: `${validated.brand_name} - ${validated.contact_name}`,
          area: `${validated.city} - ${validated.area}`,
          phone: validated.phone,
          phone_normalized: phoneNorm,
          website: validated.store_url || null,
          research_owner_id: salesRepId || "01ffbb15-b64b-4efe-a77e-2d5ae5d4a18a",
          status: "NEW",
          notes: fullNotes,
          created_by: salesRepId || "01ffbb15-b64b-4efe-a77e-2d5ae5d4a18a",
        })
        .select()
        .single();

      if (pcError || !pcInserted) {
        console.error("[createNexaLead] Fallback to potential_clients failed:", pcError);
        return {
          success: false,
          error: pcError?.message || tableError || "فشل تسجيل العميل في قاعدة البيانات",
        };
      }

      insertedLead = {
        id: pcInserted.id,
        business_id: pcInserted.business_id,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        phone: validated.phone,
        phone_normalized: phoneNorm,
        alternative_phone: validated.alternative_phone || null,
        email: validated.email || null,
        store_url: validated.store_url || null,
        city: validated.city,
        area: validated.area,
        address: validated.address || null,
        gps_latitude: validated.gps_latitude || null,
        gps_longitude: validated.gps_longitude || null,
        gps_maps_url: validated.gps_maps_url || null,
        vertical_type: validated.vertical_type,
        commerce_model: validated.commerce_model,
        current_system: validated.current_system,
        monthly_order_volume: validated.monthly_order_volume || null,
        branches_count: validated.branches_count,
        plan_interest: validated.plan_interest,
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget ?? 0,
        next_action: validated.next_action || null,
        next_action_date: validated.next_action_date || null,
        notes: validated.notes || null,
        sales_rep_id: salesRepId || null,
        sales_rep_name: user?.user_metadata?.full_name || null,
        status: "NEW",
        archived_at: null,
        created_at: pcInserted.created_at,
        updated_at: pcInserted.updated_at,
      };
    }

    // 3. Log activity in activities table
    try {
      await supabase.from("activities").insert({
        actor_id: salesRepId,
        type: "NOTE",
        summary: `تم تسجيل عميل جديد لمنصة Nexa: ${validated.brand_name} (${validated.vertical_type})`,
        notes: `النشاط: ${validated.vertical_type}، الفروع: ${validated.branches_count}، الخطة: ${validated.plan_interest}`,
      });
    } catch {
      // Non-blocking
    }

    // 4. Live notification dispatch across team devices
    try {
      await broadcastNotification({
        title: `🛍️ عميل Nexa جديد: ${validated.brand_name}`,
        body: `تم تسجيل عميل جديد لمنصة Nexa (${validated.brand_name}) في منطقة ${validated.area} - باقة ${validated.plan_interest}`,
        category: "UPDATE",
        type: "SUCCESS",
        link: "/nexa",
        notifyAdminsAndGMs: true,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/nexa");
    revalidatePath("/dashboard");
    return { success: true, data: insertedLead as NexaLead };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "Unexpected error occurred"),
    };
  }
}

/**
 * Fetch Nexa Leads with optional filtering and aggregate KPIs
 */
export async function getNexaLeads(
  filters?: NexaFilterParams
): Promise<ActionResult<{ leads: NexaLead[]; metrics: NexaMetrics }>> {
  try {
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      let filtered = [...demoNexaLeadsStore];

      if (filters?.query) {
        const q = filters.query.toLowerCase().trim();
        filtered = filtered.filter(
          (l) =>
            l.brand_name.toLowerCase().includes(q) ||
            l.contact_name.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            l.area.toLowerCase().includes(q)
        );
      }

      if (filters?.interest_level && filters.interest_level !== "ALL") {
        filtered = filtered.filter(
          (l) => l.interest_level === filters.interest_level
        );
      }

      if (filters?.vertical_type && filters.vertical_type !== "ALL") {
        filtered = filtered.filter(
          (l) => l.vertical_type === filters.vertical_type
        );
      }

      if (filters?.status && filters.status !== "ALL") {
        filtered = filtered.filter((l) => l.status === filters.status);
      }

      const totalBranches = filtered.reduce((acc, l) => {
        if (l.branches_count === "1") return acc + 1;
        if (l.branches_count === "2-3") return acc + 3;
        if (l.branches_count === "4-6") return acc + 5;
        if (l.branches_count === "7-10") return acc + 8;
        return acc + 12;
      }, 0);

      const metrics: NexaMetrics = {
        totalLeads: filtered.length,
        hotLeadsCount: filtered.filter((l) => l.interest_level === "HOT").length,
        totalBranchesCount: totalBranches,
        estimatedPipelineValue: filtered.reduce(
          (sum, l) => sum + (Number(l.estimated_budget) || 0),
          0
        ),
        demosScheduledCount: filtered.filter(
          (l) => l.status === "DEMO_SCHEDULED"
        ).length,
      };

      return { success: true, data: { leads: filtered, metrics } };
    }

    const supabase = await createSupabaseServerClient();

    // Query nexa_leads
    let query = supabase
      .from("nexa_leads")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (filters?.query) {
      const q = filters.query.trim();
      query = query.or(
        `brand_name.ilike.%${q}%,contact_name.ilike.%${q}%,phone.ilike.%${q}%,area.ilike.%${q}%`
      );
    }

    if (filters?.interest_level && filters.interest_level !== "ALL") {
      query = query.eq("interest_level", filters.interest_level);
    }

    if (filters?.vertical_type && filters.vertical_type !== "ALL") {
      query = query.eq("vertical_type", filters.vertical_type);
    }

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    let leads: NexaLead[] = [];

    if (data && !error) {
      leads = data as NexaLead[];
    } else {
      // Table missing -> fallback to potential_clients with [NEXA_LEAD] in notes
      const { data: pcData, error: pcErr } = await supabase
        .from("potential_clients")
        .select(`
          *,
          research_owner:profiles!research_owner_id(full_name)
        `)
        .is("archived_at", null)
        .like("notes", "%[NEXA_LEAD]%")
        .order("created_at", { ascending: false });

      if (pcErr) {
        return {
          success: false,
          error: getErrorMessage(pcErr, "Failed to load leads"),
        };
      }

      const adaptedLeads: NexaLead[] = (pcData || []).map((pc) => {
        let meta: Record<string, any> = {};
        if (pc.notes && pc.notes.includes("__NEXA_DATA__:")) {
          try {
            const jsonPart = pc.notes.split("__NEXA_DATA__:")[1];
            meta = JSON.parse(jsonPart);
          } catch {
            // ignore
          }
        }

        const cleanNotes = pc.notes
          ? pc.notes
              .replace(/\[NEXA_LEAD\]/g, "")
              .split("__NEXA_DATA__:")[0]
              .trim()
          : null;

        return {
          id: pc.id,
          business_id: pc.business_id,
          brand_name: meta.brand_name || pc.name.split(" - ")[0] || pc.name,
          contact_name: meta.contact_name || pc.name.split(" - ")[1] || "—",
          contact_role: meta.contact_role || "OWNER",
          phone: pc.phone || "",
          phone_normalized: pc.phone_normalized || pc.phone || "",
          alternative_phone: meta.alternative_phone || null,
          email: meta.email || null,
          store_url: meta.store_url || pc.website || null,
          city: meta.city || (pc.area ? pc.area.split(" - ")[0] : "القاهرة"),
          area: meta.area || (pc.area ? pc.area.split(" - ")[1] || pc.area : ""),
          address: meta.address || null,
          gps_latitude: meta.gps_latitude || null,
          gps_longitude: meta.gps_longitude || null,
          gps_maps_url: meta.gps_maps_url || null,
          vertical_type: meta.vertical_type || "FASHION_APPAREL",
          commerce_model: meta.commerce_model || "OMNICHANNEL",
          current_system: meta.current_system || "NONE_EXCEL",
          monthly_order_volume: meta.monthly_order_volume || "100_500",
          branches_count: meta.branches_count || "1",
          plan_interest: meta.plan_interest || "GROWTH",
          interest_level: meta.interest_level || "WARM",
          estimated_budget: meta.estimated_budget || 0,
          next_action: meta.next_action || null,
          next_action_date: meta.next_action_date || null,
          notes: cleanNotes,
          sales_rep_id: pc.research_owner_id,
          sales_rep_name: pc.research_owner?.full_name || null,
          status: (meta.status as NexaLeadStatus) || (pc.status === "CONVERTED" ? "WON" : "NEW"),
          archived_at: pc.archived_at,
          created_at: pc.created_at,
          updated_at: pc.updated_at,
        };
      });

      leads = adaptedLeads;

      if (filters?.query) {
        const q = filters.query.toLowerCase().trim();
        leads = leads.filter(
          (l) =>
            l.brand_name.toLowerCase().includes(q) ||
            l.contact_name.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            l.area.toLowerCase().includes(q)
        );
      }

      if (filters?.interest_level && filters.interest_level !== "ALL") {
        leads = leads.filter(
          (l) => l.interest_level === filters.interest_level
        );
      }

      if (filters?.vertical_type && filters.vertical_type !== "ALL") {
        leads = leads.filter(
          (l) => l.vertical_type === filters.vertical_type
        );
      }

      if (filters?.status && filters.status !== "ALL") {
        leads = leads.filter((l) => l.status === filters.status);
      }
    }

    const totalBranches = leads.reduce((acc, l) => {
      if (l.branches_count === "1") return acc + 1;
      if (l.branches_count === "2-3") return acc + 3;
      if (l.branches_count === "4-6") return acc + 5;
      if (l.branches_count === "7-10") return acc + 8;
      return acc + 12;
    }, 0);

    const metrics: NexaMetrics = {
      totalLeads: leads.length,
      hotLeadsCount: leads.filter((l) => l.interest_level === "HOT").length,
      totalBranchesCount: totalBranches,
      estimatedPipelineValue: leads.reduce(
        (sum, l) => sum + (Number(l.estimated_budget) || 0),
        0
      ),
      demosScheduledCount: leads.filter((l) => l.status === "DEMO_SCHEDULED")
        .length,
    };

    return { success: true, data: { leads, metrics } };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "Unexpected error occurred"),
    };
  }
}

/**
 * Update Nexa Lead status
 */
export async function updateNexaLeadStatus(
  input: UpdateNexaLeadStatusInput
): Promise<ActionResult<NexaLead>> {
  try {
    const validated = updateNexaLeadStatusSchema.parse(input);
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const idx = demoNexaLeadsStore.findIndex((l) => l.id === validated.id);
      if (idx !== -1) {
        demoNexaLeadsStore[idx].status = validated.status;
        demoNexaLeadsStore[idx].updated_at = new Date().toISOString();
        revalidatePath("/nexa");
        return { success: true, data: demoNexaLeadsStore[idx] };
      }
      return { success: false, error: "Lead not found" };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("nexa_leads")
      .update({
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      // Fallback: update in potential_clients if nexa_leads doesn't exist
      const { data: pcData } = await supabase
        .from("potential_clients")
        .select("notes, status")
        .eq("id", validated.id)
        .single();

      if (pcData) {
        let meta: Record<string, any> = {};
        if (pcData.notes && pcData.notes.includes("__NEXA_DATA__:")) {
          try {
            meta = JSON.parse(pcData.notes.split("__NEXA_DATA__:")[1]);
          } catch {}
        }
        meta.status = validated.status;

        const baseNotes = pcData.notes.split("__NEXA_DATA__:")[0].trim();
        const updatedNotes = `${baseNotes}\n__NEXA_DATA__:${JSON.stringify(meta)}`;

        await supabase
          .from("potential_clients")
          .update({
            status: validated.status === "WON" ? "CONVERTED" : "RESEARCHED",
            notes: updatedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", validated.id);

        revalidatePath("/nexa");
        return { success: true };
      }

      return {
        success: false,
        error: getErrorMessage(error, "Failed to update lead status"),
      };
    }

    revalidatePath("/nexa");
    return { success: true, data: data as NexaLead };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "Unexpected error occurred"),
    };
  }
}

/**
 * Delete / Archive a Nexa Lead
 */
export async function deleteNexaLead(id: string): Promise<ActionResult<void>> {
  try {
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const idx = demoNexaLeadsStore.findIndex((l) => l.id === id);
      if (idx !== -1) {
        demoNexaLeadsStore.splice(idx, 1);
        revalidatePath("/nexa");
        return { success: true };
      }
      return { success: false, error: "Lead not found" };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("nexa_leads")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      // Fallback: archive in potential_clients
      await supabase
        .from("potential_clients")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
    }

    revalidatePath("/nexa");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: getErrorMessage(err, "Unexpected error occurred"),
    };
  }
}
