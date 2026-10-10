"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoLeadSources, demoServices } from "@/lib/demo-data";
import {
  createServiceSchema,
  updateServiceSchema,
  createLeadSourceSchema,
  updateLeadSourceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
  type CreateLeadSourceInput,
  type UpdateLeadSourceInput,
} from "@/lib/schemas/settings";
import type { Service, LeadSource } from "@/types/domain";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdminOrGm(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role === "GM" || profile?.role === "ADMIN";
}

/**
 * Fetch all catalog services
 */
export async function getServices(): Promise<ActionResult<Service[]>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        data: [...demoServices],
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []) as unknown as Service[],
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load services") };
  }
}

/**
 * Create a new service in catalog
 */
export async function createService(
  input: CreateServiceInput
): Promise<ActionResult<Service>> {
  try {
    const validated = createServiceSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const newService: Service = {
        id: `srv-${Date.now().toString().slice(-4)}`,
        name_ar: validated.name_ar,
        name_en: validated.name_en,
        description_ar: validated.description_ar || null,
        description_en: validated.description_en || null,
        internal_reference_price: validated.internal_reference_price != null ? String(validated.internal_reference_price) : null,
        currency: validated.currency || "EGP",
        is_active: true,
        sort_order: demoServices.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoServices.push(newService);
      revalidatePath("/settings");
      return { success: true, data: newService };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        name_ar: validated.name_ar,
        name_en: validated.name_en,
        description_ar: validated.description_ar || null,
        description_en: validated.description_en || null,
        internal_reference_price: validated.internal_reference_price,
        currency: validated.currency || "EGP",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, data: data as unknown as Service };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create service") };
  }
}

/**
 * Update service details (restricted to GM & ADMIN)
 */
export async function updateService(
  id: string,
  input: UpdateServiceInput
): Promise<ActionResult<Service>> {
  try {
    const validated = updateServiceSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const srv = demoServices.find((s) => s.id === id);
      if (srv) {
        if (validated.name_ar) srv.name_ar = validated.name_ar;
        if (validated.name_en) srv.name_en = validated.name_en;
        if (validated.internal_reference_price != null)
          srv.internal_reference_price = String(validated.internal_reference_price);
        if (validated.currency) srv.currency = validated.currency;
        if (validated.is_active !== undefined) srv.is_active = validated.is_active;
        srv.updated_at = new Date().toISOString();
      }
      revalidatePath("/settings");
      return { success: true, data: srv };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { data, error } = await supabase
      .from("services")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, data: data as unknown as Service };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update service") };
  }
}

/**
 * Delete or archive service (restricted to GM & ADMIN)
 */
export async function deleteService(id: string): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured()) {
      const idx = demoServices.findIndex((s) => s.id === id);
      if (idx !== -1) {
        demoServices.splice(idx, 1);
      }
      revalidatePath("/settings");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        // Referenced in deals or proposals — archive instead
        await supabase
          .from("services")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", id);

        revalidatePath("/settings");
        return { success: true, warning: "serviceInUseArchived" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to delete service") };
  }
}

/**
 * Fetch all lead sources
 */
export async function getLeadSources(): Promise<ActionResult<LeadSource[]>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        data: [...demoLeadSources] as unknown as LeadSource[],
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("lead_sources")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []) as unknown as LeadSource[],
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load lead sources") };
  }
}

/**
 * Create a new lead source (restricted to GM & ADMIN)
 */
export async function createLeadSource(
  input: CreateLeadSourceInput
): Promise<ActionResult<LeadSource>> {
  try {
    const validated = createLeadSourceSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const newSource = {
        id: `src-${Date.now().toString().slice(-4)}`,
        name_ar: validated.name_ar,
        name_en: validated.name_en,
        is_active: true,
        sort_order: demoLeadSources.length + 1,
      };
      demoLeadSources.push(newSource);
      revalidatePath("/settings");
      return { success: true, data: newSource as unknown as LeadSource };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { data, error } = await supabase
      .from("lead_sources")
      .insert({
        name_ar: validated.name_ar,
        name_en: validated.name_en,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, data: data as unknown as LeadSource };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create lead source") };
  }
}

/**
 * Update lead source (restricted to GM & ADMIN)
 */
export async function updateLeadSource(
  id: string,
  input: UpdateLeadSourceInput
): Promise<ActionResult<LeadSource>> {
  try {
    const validated = updateLeadSourceSchema.parse(input);

    if (!isSupabaseConfigured()) {
      const src = demoLeadSources.find((s) => s.id === id);
      if (src) {
        if (validated.name_ar) src.name_ar = validated.name_ar;
        if (validated.name_en) src.name_en = validated.name_en;
        if (validated.is_active !== undefined) src.is_active = validated.is_active;
      }
      revalidatePath("/settings");
      return { success: true, data: src as unknown as LeadSource };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { data, error } = await supabase
      .from("lead_sources")
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, data: data as unknown as LeadSource };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update lead source") };
  }
}

/**
 * Delete or archive lead source (restricted to GM & ADMIN)
 */
export async function deleteLeadSource(id: string): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured()) {
      const idx = demoLeadSources.findIndex((s) => s.id === id);
      if (idx !== -1) {
        demoLeadSources.splice(idx, 1);
      }
      revalidatePath("/settings");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const canManage = await checkAdminOrGm(supabase, user.id);
    if (!canManage) {
      return { success: false, error: "Unauthorized: Admin or GM role required" };
    }

    const { error } = await supabase.from("lead_sources").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        // Referenced in deals or potential_clients — archive instead
        await supabase
          .from("lead_sources")
          .update({ is_active: false })
          .eq("id", id);

        revalidatePath("/settings");
        return { success: true, warning: "sourceInUseArchived" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to delete lead source") };
  }
}
