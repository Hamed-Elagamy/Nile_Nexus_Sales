/**
 * Supabase configuration utilities & environment detector
 */

export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return raw.replace(/^\uFEFF/, "").trim();
}

export function getSupabaseAnonKey(): string {
  const raw = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
  return raw.replace(/^\uFEFF/, "").trim();
}

export function isSupabaseConfigured(): boolean {
  if (process.env.NODE_ENV === "test") return true;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) return false;
  if (url.includes("your-project") || key.includes("your-anon-key")) return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;

  return true;
}

export const FALLBACK_SUPABASE_URL = "https://placeholder-nile-nexus.supabase.co";
export const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24ifQ.placeholder";

export const DEMO_USERS = {
  gm: {
    id: "01ffbb15-b64b-4efe-a77e-2d5ae5d4a18a",
    email: "hamedelagamy00@gmail.com",
    role: "GM" as const,
    user_metadata: {
      full_name: "محمد حامد",
      role: "GM",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
  admin: {
    id: "bd1ce4e9-0445-4179-b770-4b65b2bf2f50",
    email: "fnesma54@gmail.com",
    role: "ADMIN" as const,
    user_metadata: {
      full_name: "نسمة فتحي",
      role: "ADMIN",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
  sales: {
    id: "5e3931d2-b134-4c6a-bbfe-70314715cf12",
    email: "ofawzy952@gmail.com",
    role: "SALES" as const,
    user_metadata: {
      full_name: "عمر الباجوري",
      role: "SALES",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
};

