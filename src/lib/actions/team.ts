"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoProfiles } from "@/lib/demo-data";
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
    if (!isSupabaseConfigured()) {
      const statsMap: Record<string, { deals: number; clients: number }> = {
        "00000000-0000-0000-0000-000000000003": { deals: 3, clients: 2 },
        "00000000-0000-0000-0000-000000000004": { deals: 2, clients: 2 },
        "00000000-0000-0000-0000-000000000001": { deals: 0, clients: 0 },
        "00000000-0000-0000-0000-000000000002": { deals: 0, clients: 0 },
      };

      const members: TeamMemberWithStats[] = demoProfiles.map((p) => ({
        ...p,
        active_deals_count: statsMap[p.id]?.deals || 0,
        total_clients_count: statsMap[p.id]?.clients || 0,
      }));

      return {
        success: true,
        data: members,
      };
    }

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

    if (!isSupabaseConfigured()) {
      const member = demoProfiles.find((p) => p.id === validated.user_id);
      if (member) {
        member.role = validated.role;
      }
      revalidatePath("/team");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: validated.role })
      .eq("id", validated.user_id);

    if (error) {
      return { success: false, error: error.message };
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

    if (!isSupabaseConfigured()) {
      const member = demoProfiles.find((p) => p.id === validated.user_id);
      if (member) {
        member.is_active = validated.is_active;
      }
      revalidatePath("/team");
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: validated.is_active })
      .eq("id", validated.user_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/team");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to toggle status") };
  }
}
