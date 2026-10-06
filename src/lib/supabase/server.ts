import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabaseAnonKey,
  FALLBACK_SUPABASE_URL,
  FALLBACK_SUPABASE_ANON_KEY,
  DEMO_USERS,
} from "./config";
import type { User } from "@supabase/supabase-js";

/**
 * Create a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the anon key — all queries are subject to RLS.
 * Gracefully provides demo user state when running in offline/demo mode.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    const roleCookie = cookieStore.get("nile_demo_role")?.value || "gm";
    const demoUser =
      DEMO_USERS[roleCookie as keyof typeof DEMO_USERS] || DEMO_USERS.gm;

    const baseClient = createServerClient(
      FALLBACK_SUPABASE_URL,
      FALLBACK_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in Server Components
            }
          },
        },
      }
    );

    // Override auth.getUser in demo mode to return the active demo user
    baseClient.auth.getUser = (async () => {
      const hasSignedOut =
        cookieStore.get("nile_demo_signed_out")?.value === "true";
      if (hasSignedOut) {
        return { data: { user: null }, error: null };
      }
      return { data: { user: demoUser as unknown as User }, error: null };
    }) as typeof baseClient.auth.getUser;

    return baseClient;
  }

  const client = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from Server Components where
            // cookies cannot be set. This is expected and can be safely ignored
            // when refreshing access tokens in middleware.
          }
        },
      },
    }
  );

  const roleCookie = cookieStore.get("nile_demo_role")?.value;
  const isSignedOut = cookieStore.get("nile_demo_signed_out")?.value === "true";

  if (roleCookie && !isSignedOut) {
    const origGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = (async () => {
      const { data, error } = await origGetUser();
      if (data?.user) return { data, error };
      const demoUser =
        DEMO_USERS[roleCookie as keyof typeof DEMO_USERS] || DEMO_USERS.gm;
      return { data: { user: demoUser as unknown as User }, error: null };
    }) as typeof client.auth.getUser;
  }

  return client;
}
