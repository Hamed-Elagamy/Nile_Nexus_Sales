import { createBrowserClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabaseAnonKey,
  FALLBACK_SUPABASE_URL,
  FALLBACK_SUPABASE_ANON_KEY,
} from "./config";

/**
 * Create a Supabase client for use in browser/Client Components.
 * Uses the anon key — all queries are subject to RLS.
 * Falls back gracefully to placeholder configuration when running in demo/offline mode.
 */
export function createClient() {
  const url = isSupabaseConfigured()
    ? getSupabaseUrl()
    : FALLBACK_SUPABASE_URL;

  const key = isSupabaseConfigured()
    ? getSupabaseAnonKey()
    : FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient(url, key);
}
