"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : supabase;

    const { data, error } = await dbClient
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
 * Upload an avatar image file to Supabase Storage 'avatars' bucket
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<string>> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No image file provided" };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Invalid image file format" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image size exceeds 5MB limit" };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase storage is not configured" };
    }

    const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : supabase;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await dbClient.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Append cache-buster timestamp
    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    return { success: true, data: avatarUrl };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to upload avatar image") };
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

    const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : supabase;

    // 1. Try to UPDATE existing row first.
    // Unlike .upsert() which triggers an INSERT RLS check, an UPDATE statement uses
    // the existing `profiles_update_own` RLS policy (USING (id = auth.uid()) WITH CHECK (id = auth.uid())).
    const { data: updatedProfile, error: updateError } = await dbClient
      .from("profiles")
      .update({
        full_name: validated.full_name,
        phone: validated.phone || null,
        avatar_url: validated.avatar_url || null,
        preferred_locale: validated.preferred_locale,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .maybeSingle();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    let finalProfile = updatedProfile;

    // 2. If no existing row was updated (profile didn't exist yet), insert it
    if (!finalProfile) {
      const { data: insertedProfile, error: insertError } = await dbClient
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: validated.full_name,
          role: ((user.user_metadata?.role as string) || "SALES") as Profile["role"],
          phone: validated.phone || null,
          avatar_url: validated.avatar_url || null,
          preferred_locale: validated.preferred_locale,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }
      finalProfile = insertedProfile;
    }

    // 3. Update auth user metadata safely (name and phone ONLY).
    // CRITICAL: NEVER pass data: URLs into auth.updateUser!
    // Supabase stores user_metadata in the JWT session token which gets placed in the browser Cookie header.
    // Putting data URLs (30KB+) in cookies immediately violates Vercel's 16KB header limit (494 REQUEST_HEADER_TOO_LARGE).
    try {
      const isHttpUrl = Boolean(
        validated.avatar_url &&
          (validated.avatar_url.startsWith("http://") ||
            validated.avatar_url.startsWith("https://"))
      );

      await supabase.auth.updateUser({
        data: {
          full_name: validated.full_name,
          phone: validated.phone || null,
          // Only store clean HTTP URLs in metadata, or null to keep JWT under 1KB
          avatar_url: isHttpUrl ? validated.avatar_url : null,
        },
      });
    } catch {
      // Non-fatal if auth metadata update fails
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/team");

    return { success: true, data: finalProfile as unknown as Profile };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to update profile") };
  }
}
