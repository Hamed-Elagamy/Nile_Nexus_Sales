"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
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
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("services")
      .insert({
        name_ar: validated.name_ar,
        name_en: validated.name_en,
        description_ar: validated.description_ar || null,
        description_en: validated.description_en || null,
        internal_reference_price: validated.internal_reference_price
          ? validated.internal_reference_price.toString()
          : null,
        currency: validated.currency || "EGP",
        sort_order: validated.sort_order,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create service" };
    }

    revalidatePath("/settings");

    return {
      success: true,
      data: data as unknown as Service,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create service") };
  }
}

/**
 * Update an existing service
 */
export async function updateService(
  id: string,
  input: UpdateServiceInput
): Promise<ActionResult> {
  try {
    const validated = updateServiceSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.name_ar !== undefined) updatePayload.name_ar = validated.name_ar;
    if (validated.name_en !== undefined) updatePayload.name_en = validated.name_en;
    if (validated.description_ar !== undefined) updatePayload.description_ar = validated.description_ar;
    if (validated.description_en !== undefined) updatePayload.description_en = validated.description_en;
    if (validated.internal_reference_price !== undefined) {
      updatePayload.internal_reference_price = validated.internal_reference_price
        ? validated.internal_reference_price.toString()
        : null;
    }
    if (validated.currency !== undefined) updatePayload.currency = validated.currency;
    if (validated.is_active !== undefined) updatePayload.is_active = validated.is_active;

    const { error } = await supabase
      .from("services")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update service") };
  }
}

/**
 * Fetch all lead sources
 */
export async function getLeadSources(): Promise<ActionResult<LeadSource[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("lead_sources")
      .select("*")
      .order("created_at", { ascending: true });

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
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("lead_sources")
      .insert({
        name_ar: validated.name_ar,
        name_en: validated.name_en,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to create lead source" };
    }

    revalidatePath("/settings");

    return {
      success: true,
      data: data as unknown as LeadSource,
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to create lead source") };
  }
}
