"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoLeadSources, demoServices } from "@/lib/demo-data";
import {
  createServiceSchema,
  updateServiceSchema,
  createLeadSourceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
  type CreateLeadSourceInput,
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
 * Update service details
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
 * Create a new lead source
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
