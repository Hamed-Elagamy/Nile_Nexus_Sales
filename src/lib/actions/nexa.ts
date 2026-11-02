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

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

// In-memory store for demo / offline fallback
const demoNexaLeadsStore: NexaLead[] = [];

function getErrorMessage(err: unknown, fallback: string): string {
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

    // Generate business ID
    const countRes = await supabase
      .from("nexa_leads")
      .select("id", { count: "exact", head: true });

    let nextNumber = 1;
    if (countRes && typeof countRes.count === "number") {
      nextNumber = countRes.count + 1;
    }
    const businessId = `NXA-${String(nextNumber).padStart(5, "0")}`;

    // Attempt insert into dedicated nexa_leads table
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
        sales_rep_id: user?.id || null,
        sales_rep_name: user?.user_metadata?.full_name || user?.email || null,
        status: "NEW",
      })
      .select()
      .single();

    if (insertError) {
      // Graceful fallback to potential_clients if table migration 013 is not yet run
      if (
        insertError.code === "42P01" ||
        insertError.message.includes("nexa_leads")
      ) {
        console.warn(
          "[Nexa Leads] Table nexa_leads not found, falling back to potential_clients with [NEXA_LEAD] tag"
        );

        const countFallback = await supabase
          .from("potential_clients")
          .select("id", { count: "exact", head: true });
        const fallbackBusinessId = `NXA-PC-${String(
          (countFallback.count || 0) + 1
        ).padStart(5, "0")}`;

        const nexaMetaNotes = [
          `[NEXA_LEAD]`,
          `Vertical: ${validated.vertical_type}`,
          `Commerce Model: ${validated.commerce_model}`,
          `Branches: ${validated.branches_count}`,
          `Current System: ${validated.current_system}`,
          `Plan: ${validated.plan_interest}`,
          `Store URL: ${validated.store_url || "N/A"}`,
          `GPS: ${validated.gps_maps_url || "N/A"}`,
          validated.notes ? `Notes: ${validated.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        const { data: pcInserted, error: pcError } = await supabase
          .from("potential_clients")
          .insert({
            business_id: fallbackBusinessId,
            company_name: validated.brand_name,
            contact_name: validated.contact_name,
            job_title: validated.contact_role,
            phone: validated.phone,
            phone_normalized: phoneNorm,
            alternative_phone: validated.alternative_phone || null,
            email: validated.email || null,
            website: validated.store_url || null,
            city: validated.city,
            area: validated.area,
            address: validated.address || null,
            industry: `Nexa E-Commerce: ${validated.vertical_type}`,
            status: "QUALIFIED",
            estimated_budget: validated.estimated_budget ?? 0,
            next_action: validated.next_action || null,
            next_action_date: validated.next_action_date || null,
            notes: nexaMetaNotes,
            source: "FIELD_SALES",
            assigned_to: user?.id || null,
          })
          .select()
          .single();

        if (pcError) {
          return {
            success: false,
            error: getErrorMessage(pcError, "Failed to register lead"),
          };
        }

        const fallbackLead: NexaLead = {
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
          sales_rep_id: user?.id || null,
          sales_rep_name: user?.user_metadata?.full_name || null,
          status: "NEW",
          archived_at: null,
          created_at: pcInserted.created_at,
          updated_at: pcInserted.updated_at,
        };

        revalidatePath("/nexa");
        return { success: true, data: fallbackLead };
      }

      return {
        success: false,
        error: getErrorMessage(insertError, "Failed to insert lead"),
      };
    }

    // Schedule automatic follow up if date provided
    if (validated.next_action_date) {
      try {
        await supabase.from("follow_ups").insert({
          title: `متابعة عميل نكسا: ${validated.brand_name}`,
          type: "MEETING",
          due_date: validated.next_action_date,
          status: "SCHEDULED",
          priority: validated.interest_level === "HOT" ? "HIGH" : "NORMAL",
          notes: `إجراء: ${validated.next_action || "عرض توضيحي لمنصة نكسا (Demo)"}\nالمسؤول: ${validated.contact_name} (${validated.phone})`,
          assigned_to: user?.id || null,
        });
      } catch {
        // Non-blocking
      }
    }

    // Log Activity
    try {
      await supabase.from("activities").insert({
        activity_type: "NOTE",
        title: `تسجيل عميل نكسا ميداني جديد: ${validated.brand_name}`,
        description: `تم تسجيل المتجر بنجاح بواسطة ${user?.user_metadata?.full_name || "مندوب المبيعات"}. النشاط: ${validated.vertical_type}، الفروع: ${validated.branches_count}، الخطة: ${validated.plan_interest}`,
        user_id: user?.id || null,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/nexa");
    revalidatePath("/dashboard");
    return { success: true, data: inserted as NexaLead };
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

    if (error) {
      // Check if table missing -> fallback to potential_clients
      if (error.code === "42P01" || error.message.includes("nexa_leads")) {
        const { data: pcData, error: pcErr } = await supabase
          .from("potential_clients")
          .select("*")
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
          return {
            id: pc.id,
            business_id: pc.business_id,
            brand_name: pc.company_name,
            contact_name: pc.contact_name,
            contact_role: "OWNER",
            phone: pc.phone,
            phone_normalized: pc.phone_normalized || pc.phone,
            alternative_phone: pc.alternative_phone,
            email: pc.email,
            store_url: pc.website,
            city: pc.city || "القاهرة",
            area: pc.area || "",
            address: pc.address,
            gps_latitude: null,
            gps_longitude: null,
            gps_maps_url: null,
            vertical_type: "GENERAL_RETAIL",
            commerce_model: "OMNICHANNEL",
            current_system: "NONE_EXCEL",
            monthly_order_volume: "100_500",
            branches_count: "1",
            plan_interest: "GROWTH",
            interest_level: "WARM",
            estimated_budget: pc.estimated_budget || 0,
            next_action: pc.next_action,
            next_action_date: pc.next_action_date,
            notes: pc.notes,
            sales_rep_id: pc.assigned_to,
            sales_rep_name: null,
            status: "NEW",
            archived_at: pc.archived_at,
            created_at: pc.created_at,
            updated_at: pc.updated_at,
          };
        });

        const metrics: NexaMetrics = {
          totalLeads: adaptedLeads.length,
          hotLeadsCount: adaptedLeads.filter((l) => l.interest_level === "HOT").length,
          totalBranchesCount: adaptedLeads.length,
          estimatedPipelineValue: adaptedLeads.reduce(
            (s, l) => s + (l.estimated_budget || 0),
            0
          ),
          demosScheduledCount: 0,
        };

        return { success: true, data: { leads: adaptedLeads, metrics } };
      }

      return {
        success: false,
        error: getErrorMessage(error, "Failed to load Nexa leads"),
      };
    }

    const leads = (data || []) as NexaLead[];

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
      return {
        success: false,
        error: getErrorMessage(error, "Failed to delete lead"),
      };
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
