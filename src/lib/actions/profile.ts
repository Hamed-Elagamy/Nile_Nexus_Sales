"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoProfiles } from "@/lib/demo-data";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/schemas/profile";
import type { Profile } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Fetch the profile of the currently authenticated user
 */
export async function getCurrentUserProfile(): Promise<ActionResult<Profile>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    if (!isSupabaseConfigured()) {
      const demoUser = demoProfiles.find((p) => p.email === user.email) || demoProfiles[0];
      return { success: true, data: demoUser };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      // If profile does not exist yet, build fallback from auth user
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || "",
        full_name: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "",
        employee_id: null,
        role: ((user.user_metadata?.role as string) || "GM") as Profile["role"],
        phone: (user.user_metadata?.phone as string) || null,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
        preferred_locale: "ar",
        is_active: true,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: fallbackProfile };
    }

    return { success: true, data: data as unknown as Profile };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load user profile") };
  }
}

/**
 * Update the profile information (full_name, phone, avatar_url, preferred_locale)
 */
export async function updateCurrentUserProfile(
  input: UpdateProfileInput
): Promise<ActionResult<Profile>> {
  try {
    const validated = updateProfileSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    if (!isSupabaseConfigured()) {
      const demoUser = demoProfiles.find((p) => p.email === user.email) || demoProfiles[0];
      demoUser.full_name = validated.full_name;
      demoUser.phone = validated.phone || null;
      demoUser.avatar_url = validated.avatar_url || null;
      demoUser.preferred_locale = validated.preferred_locale;
      revalidatePath("/", "layout");
      return { success: true, data: demoUser };
    }

    // 1. Update profiles table
    const { data: updatedProfile, error: dbError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name: validated.full_name,
          phone: validated.phone || null,
          avatar_url: validated.avatar_url || null,
          preferred_locale: validated.preferred_locale,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    // 2. Also update auth user metadata so header and session match immediately
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: validated.full_name,
          phone: validated.phone || null,
          avatar_url: validated.avatar_url || null,
        },
      });
    } catch {
      // Non-fatal if auth metadata update fails
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/team");

    return { success: true, data: updatedProfile as unknown as Profile };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update profile") };
  }
}
