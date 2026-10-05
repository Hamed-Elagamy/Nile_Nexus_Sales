"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  updateMemberRoleSchema,
  toggleMemberStatusSchema,
  type UpdateMemberRoleInput,
  type ToggleMemberStatusInput,
} from "@/lib/schemas/team";
import type { Profile } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface TeamMemberWithStats extends Profile {
  active_deals_count?: number;
  total_clients_count?: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Fetch all team profiles
 */
export async function getTeamMembers(): Promise<ActionResult<TeamMemberWithStats[]>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []) as unknown as TeamMemberWithStats[],
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load team members") };
  }
}

/**
 * Update member role (e.g. GM, ADMIN, SALES)
 */
export async function updateMemberRole(
  input: UpdateMemberRoleInput
): Promise<ActionResult> {
  try {
    const validated = updateMemberRoleSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Check caller role
    const { data: caller } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!caller || (caller.role !== "GM" && caller.role !== "ADMIN")) {
      return { success: false, error: "صلاحية غير كافية لتعديل أدوار الفريق" };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ role: validated.role, updated_at: new Date().toISOString() })
      .eq("id", validated.user_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/team");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update member role") };
  }
}

/**
 * Toggle member active status
 */
export async function toggleMemberStatus(
  input: ToggleMemberStatusInput
): Promise<ActionResult> {
  try {
    const validated = toggleMemberStatusSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: caller } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!caller || (caller.role !== "GM" && caller.role !== "ADMIN")) {
      return { success: false, error: "صلاحية غير كافية لتعديل حالة الحساب" };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ is_active: validated.is_active, updated_at: new Date().toISOString() })
      .eq("id", validated.user_id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/team");

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to toggle member status") };
  }
}
