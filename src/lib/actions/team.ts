"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

/**
 * Remove / Delete a team member (GM role only)
 */
export async function deleteTeamMember(input: {
  user_id: string;
}): Promise<ActionResult> {
  try {
    if (!input.user_id) {
      return { success: false, error: "Missing user ID" };
    }

    if (!isSupabaseConfigured()) {
      const idx = demoProfiles.findIndex((p) => p.id === input.user_id);
      if (idx !== -1) {
        demoProfiles.splice(idx, 1);
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

    // Verify current caller is GM
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "GM") {
      return {
        success: false,
        error: "فقط المدير العام (GM) يمتلك صلاحية حذف المستخدمين",
      };
    }

    if (input.user_id === user.id) {
      return {
        success: false,
        error: "لا يمكنك حذف حسابك الشخصي بصفتك المدير العام",
      };
    }

    // Attempt RPC delete_user_by_gm if available
    try {
      const { error: rpcErr } = await supabase.rpc("delete_user_by_gm", {
        target_user_id: input.user_id,
      });
      if (!rpcErr) {
        revalidatePath("/team");
        return { success: true };
      }
    } catch {
      // RPC not defined yet, continue with standard delete
    }

    const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : supabase;

    // Delete profile directly
    const { error: deleteError } = await dbClient
      .from("profiles")
      .delete()
      .eq("id", input.user_id);

    if (deleteError) {
      // If foreign keys prevent hard delete, deactivate the user
      await dbClient
        .from("profiles")
        .update({ is_active: false })
        .eq("id", input.user_id);

      return {
        success: true,
        warning: "تم تعطيل حساب المستخدم بدلاً من الحذف نظراً لوجود سجلات مرتبطة به",
      };
    }

    revalidatePath("/team");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to delete team member") };
  }
}

