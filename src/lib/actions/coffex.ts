"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createCoffexLeadSchema,
  updateCoffexLeadStatusSchema,
  type CreateCoffexLeadInput,
  type UpdateCoffexLeadStatusInput,
} from "@/lib/schemas/coffex";
import { normalizePhoneNumber } from "@/lib/schemas/potential-client";
import type {
  CoffexLead,
  CoffexFilterParams,
  CoffexMetrics,
  CoffexLeadStatus,
} from "@/types/coffex";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

// In-memory store for demo / offline fallback
const demoCoffexLeadsStore: CoffexLead[] = [];

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

/**
 * Create a new Coffex Onsite Sales Lead
 */
export async function createCoffexLead(
  input: CreateCoffexLeadInput
): Promise<ActionResult<CoffexLead>> {
  try {
    const validated = createCoffexLeadSchema.parse(input);
    const phoneNorm = normalizePhoneNumber(validated.phone) || validated.phone;

    // Check duplicate in memory or DB
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const newId = `cfx-${Date.now()}`;
      const businessId = `CFX-${String(demoCoffexLeadsStore.length + 1).padStart(5, "0")}`;

      const lead: CoffexLead = {
        id: newId,
        business_id: businessId,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        phone: validated.phone,
        phone_normalized: phoneNorm,
        alternative_phone: validated.alternative_phone || null,
        email: validated.email || null,
        city: validated.city,
        area: validated.area,
        address: validated.address || null,
        gps_latitude: validated.gps_latitude || null,
        gps_longitude: validated.gps_longitude || null,
        gps_maps_url: validated.gps_maps_url || null,
        activity_type: validated.activity_type,
        branches_count: validated.branches_count,
        current_system: validated.current_system,
        daily_orders_volume: validated.daily_orders_volume || null,
        interested_modules: validated.interested_modules || [],
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget || 0,
        next_action: validated.next_action || null,
        next_action_date: validated.next_action_date || null,
        notes: validated.notes || null,
        sales_rep_name: "محمد حامد",
        status: "NEW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      demoCoffexLeadsStore.unshift(lead);
      revalidatePath("/coffex");
      return { success: true, data: lead };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const salesRepId = user?.id || null;
    const salesRepName =
      (user?.user_metadata?.full_name as string) ||
      user?.email?.split("@")[0] ||
      "مندوب المبيعات";

    // Generate Business ID (CFX-00001)
    let businessId = `CFX-${Date.now().toString().slice(-5)}`;
    try {
      const { data: rpcId } = await supabase.rpc("generate_business_id", {
        p_entity_type: "coffex_lead",
      });
      if (rpcId) businessId = rpcId;
    } catch {
      // Fallback
    }

    // Try primary insertion into coffex_leads table
    let insertedLead: CoffexLead | null = null;
    let tableError: string | null = null;

    try {
      const { data, error } = await supabase
        .from("coffex_leads")
        .insert({
          business_id: businessId,
          brand_name: validated.brand_name,
          contact_name: validated.contact_name,
          contact_role: validated.contact_role,
          phone: validated.phone,
          phone_normalized: phoneNorm,
          alternative_phone: validated.alternative_phone || null,
          email: validated.email || null,
          city: validated.city,
          area: validated.area,
          address: validated.address || null,
          gps_latitude: validated.gps_latitude || null,
          gps_longitude: validated.gps_longitude || null,
          gps_maps_url: validated.gps_maps_url || null,
          activity_type: validated.activity_type,
          branches_count: validated.branches_count,
          current_system: validated.current_system,
          daily_orders_volume: validated.daily_orders_volume || null,
          interested_modules: validated.interested_modules || [],
          interest_level: validated.interest_level,
          estimated_budget: validated.estimated_budget || 0,
          next_action: validated.next_action || null,
          next_action_date: validated.next_action_date || null,
          notes: validated.notes || null,
          sales_rep_id: salesRepId,
          status: "NEW",
        })
        .select()
        .single();

      if (!error && data) {
        insertedLead = {
          ...data,
          sales_rep_name: salesRepName,
        };
      } else if (error) {
        tableError = error.message;
      }
    } catch (err: unknown) {
      tableError = getErrorMessage(err, "Table insert failed");
    }

    // If coffex_leads table is not yet created in Supabase, fall back gracefully to potential_clients
    if (!insertedLead) {
      const coffexMetadata = JSON.stringify({
        is_coffex: true,
        business_id: businessId,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        activity_type: validated.activity_type,
        branches_count: validated.branches_count,
        current_system: validated.current_system,
        daily_orders_volume: validated.daily_orders_volume,
        interested_modules: validated.interested_modules,
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget,
        next_action: validated.next_action,
        next_action_date: validated.next_action_date,
        gps_maps_url: validated.gps_maps_url,
      });

      const fullNotes = `[COFFEX_ONSITE] ${validated.notes || ""}\n__COFFEX_DATA__:${coffexMetadata}`;

      const { data: pcData, error: pcError } = await supabase
        .from("potential_clients")
        .insert({
          business_id: businessId,
          name: `${validated.brand_name} - ${validated.contact_name}`,
          area: `${validated.city} - ${validated.area}`,
          phone: validated.phone,
          phone_normalized: phoneNorm,
          research_owner_id: salesRepId || "00000000-0000-0000-0000-000000000001",
          status: "NEW",
          notes: fullNotes,
          created_by: salesRepId || "00000000-0000-0000-0000-000000000001",
        })
        .select()
        .single();

      if (pcError || !pcData) {
        return {
          success: false,
          error: pcError?.message || tableError || "Failed to record lead",
        };
      }

      insertedLead = {
        id: pcData.id,
        business_id: pcData.business_id,
        brand_name: validated.brand_name,
        contact_name: validated.contact_name,
        contact_role: validated.contact_role,
        phone: validated.phone,
        phone_normalized: phoneNorm,
        alternative_phone: validated.alternative_phone || null,
        email: validated.email || null,
        city: validated.city,
        area: validated.area,
        address: validated.address || null,
        gps_latitude: validated.gps_latitude || null,
        gps_longitude: validated.gps_longitude || null,
        gps_maps_url: validated.gps_maps_url || null,
        activity_type: validated.activity_type,
        branches_count: validated.branches_count,
        current_system: validated.current_system,
        daily_orders_volume: validated.daily_orders_volume || null,
        interested_modules: validated.interested_modules || [],
        interest_level: validated.interest_level,
        estimated_budget: validated.estimated_budget || 0,
        next_action: validated.next_action || null,
        next_action_date: validated.next_action_date || null,
        notes: validated.notes || null,
        sales_rep_id: salesRepId,
        sales_rep_name: salesRepName,
        status: "NEW",
        created_at: pcData.created_at,
        updated_at: pcData.updated_at,
      };
    }

    // Schedule Next Follow-up automatically if next_action_date is provided
    if (validated.next_action_date && salesRepId) {
      try {
        await supabase.from("follow_ups").insert({
          owner_id: salesRepId,
          due_at: new Date(validated.next_action_date).toISOString(),
          channel: "VISIT",
          direction: "OUTBOUND",
          action: `متابعة كوفيكس: ${validated.next_action || "زيارة ديمو ومتابعة العرض الفني"} (${validated.brand_name})`,
          notes: `المسؤول: ${validated.contact_name} - هاتف: ${validated.phone}`,
          status: "PENDING",
          created_by: salesRepId,
        });
      } catch {
        // Non-blocking
      }
    }

    // Log Activity for GM & Admin live stream
    if (salesRepId) {
      try {
        await supabase.from("activities").insert({
          actor_id: salesRepId,
          type: "FOLLOW_UP",
          summary: `تسجيل عميل كوفيكس ميداني جديد: ${validated.brand_name} (${validated.area})`,
          notes: `تم اللقاء مع ${validated.contact_name} (${validated.contact_role}) - درجة الاهتمام: ${validated.interest_level}`,
        });
      } catch {
        // Non-blocking
      }
    }

    revalidatePath("/coffex");
    revalidatePath("/potential-clients");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: insertedLead,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: getErrorMessage(err, "Failed to submit Coffex onsite lead"),
    };
  }
}

/**
 * Fetch all Coffex leads with filtering, search, and metrics calculation
 */
export async function getCoffexLeads(
  filters: CoffexFilterParams = {}
): Promise<ActionResult<{ leads: CoffexLead[]; metrics: CoffexMetrics }>> {
  try {
    const isConfigured = isSupabaseConfigured();

    let allLeads: CoffexLead[] = [];

    if (!isConfigured) {
      allLeads = [...demoCoffexLeadsStore];
    } else {
      const supabase = await createSupabaseServerClient();

      // First attempt: fetch from dedicated coffex_leads table
      const { data, error } = await supabase
        .from("coffex_leads")
        .select(`
          *,
          sales_rep:profiles!sales_rep_id(full_name)
        `)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        allLeads = data.map((d) => ({
          ...d,
          sales_rep_name: d.sales_rep?.full_name || null,
        }));
      } else {
        // Fallback: extract from potential_clients with [COFFEX_ONSITE] in notes
        const { data: pcData } = await supabase
          .from("potential_clients")
          .select(`
            *,
            research_owner:profiles!research_owner_id(full_name)
          `)
          .ilike("notes", "%[COFFEX_ONSITE]%")
          .is("archived_at", null)
          .order("created_at", { ascending: false });

        if (pcData) {
          allLeads = pcData.map((row) => {
            let meta: Partial<CoffexLead> = {};
            if (row.notes && row.notes.includes("__COFFEX_DATA__:")) {
              try {
                const jsonPart = row.notes.split("__COFFEX_DATA__:")[1];
                meta = JSON.parse(jsonPart);
              } catch {
                // ignore
              }
            }

            const cleanNotes = row.notes
              ? row.notes
                  .replace(/\[COFFEX_ONSITE\]/g, "")
                  .split("__COFFEX_DATA__:")[0]
                  .trim()
              : "";

            return {
              id: row.id,
              business_id: meta.business_id || row.business_id,
              brand_name: meta.brand_name || row.name.split(" - ")[0] || row.name,
              contact_name: meta.contact_name || row.name.split(" - ")[1] || "مسؤول الفرع",
              contact_role: meta.contact_role || "OWNER",
              phone: row.phone || "",
              phone_normalized: row.phone_normalized || row.phone || "",
              city: meta.city || (row.area ? row.area.split(" - ")[0] : "القاهرة"),
              area: meta.area || (row.area ? row.area.split(" - ")[1] || row.area : ""),
              activity_type: meta.activity_type || "SPECIALTY_CAFE",
              branches_count: meta.branches_count || "1",
              current_system: meta.current_system || "NONE",
              daily_orders_volume: meta.daily_orders_volume || null,
              interested_modules: meta.interested_modules || [],
              interest_level: meta.interest_level || "WARM",
              estimated_budget: meta.estimated_budget || 0,
              next_action: meta.next_action || null,
              next_action_date: meta.next_action_date || null,
              notes: cleanNotes || null,
              sales_rep_id: row.research_owner_id,
              sales_rep_name: row.research_owner?.full_name || null,
              status: row.status as CoffexLeadStatus,
              gps_maps_url: meta.gps_maps_url || null,
              created_at: row.created_at,
              updated_at: row.updated_at,
            };
          });
        }
      }
    }

    // Apply Client-Side / Query Filtering
    let filtered = [...allLeads];

    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.brand_name.toLowerCase().includes(q) ||
          lead.contact_name.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          lead.area.toLowerCase().includes(q) ||
          lead.business_id.toLowerCase().includes(q)
      );
    }

    if (filters.interest_level && filters.interest_level !== "ALL") {
      filtered = filtered.filter((l) => l.interest_level === filters.interest_level);
    }

    if (filters.activity_type && filters.activity_type !== "ALL") {
      filtered = filtered.filter((l) => l.activity_type === filters.activity_type);
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((l) => l.status === filters.status);
    }

    // Calculate Metrics
    const metrics: CoffexMetrics = {
      totalLeads: allLeads.length,
      hotLeadsCount: allLeads.filter((l) => l.interest_level === "HOT").length,
      totalBranchesCount: allLeads.reduce((sum, l) => {
        const val =
          l.branches_count === "1"
            ? 1
            : l.branches_count === "2-3"
            ? 3
            : l.branches_count === "4-6"
            ? 5
            : l.branches_count === "7-10"
            ? 8
            : 12;
        return sum + val;
      }, 0),
      estimatedPipelineValue: allLeads.reduce(
        (sum, l) => sum + (Number(l.estimated_budget) || 0),
        0
      ),
      demosScheduledCount: allLeads.filter((l) => l.status === "DEMO_SCHEDULED").length,
    };

    return {
      success: true,
      data: {
        leads: filtered,
        metrics,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: getErrorMessage(err, "Failed to load Coffex leads"),
    };
  }
}

/**
 * Update the status of a Coffex Lead
 */
export async function updateCoffexLeadStatus(
  input: UpdateCoffexLeadStatusInput
): Promise<ActionResult> {
  try {
    const validated = updateCoffexLeadStatusSchema.parse(input);
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const item = demoCoffexLeadsStore.find((l) => l.id === validated.id);
      if (item) {
        item.status = validated.status;
        item.updated_at = new Date().toISOString();
      }
      revalidatePath("/coffex");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    // Try coffex_leads table first
    const { error: coffexErr } = await supabase
      .from("coffex_leads")
      .update({
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id);

    if (coffexErr) {
      // Try potential_clients table fallback
      await supabase
        .from("potential_clients")
        .update({
          status: validated.status === "WON" ? "CONVERTED" : "RESEARCHED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", validated.id);
    }

    revalidatePath("/coffex");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: getErrorMessage(err, "Failed to update Coffex lead status"),
    };
  }
}

/**
 * Delete or archive a Coffex Lead
 */
export async function deleteCoffexLead(id: string): Promise<ActionResult> {
  try {
    const isConfigured = isSupabaseConfigured();

    if (!isConfigured) {
      const idx = demoCoffexLeadsStore.findIndex((l) => l.id === id);
      if (idx !== -1) {
        demoCoffexLeadsStore.splice(idx, 1);
      }
      revalidatePath("/coffex");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    // Soft delete if possible, otherwise delete
    const { error } = await supabase
      .from("coffex_leads")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      // Try fallback delete
      await supabase.from("potential_clients").delete().eq("id", id);
    }

    revalidatePath("/coffex");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: getErrorMessage(err, "Failed to delete Coffex lead"),
    };
  }
}
