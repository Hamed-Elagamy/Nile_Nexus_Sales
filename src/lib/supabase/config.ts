/**
 * Supabase configuration utilities & environment detector
 */

export function isSupabaseConfigured(): boolean {
  if (process.env.NODE_ENV === "test") return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    id: "00000000-0000-0000-0000-000000000001",
    email: "gm@nilenexus.com",
    role: "GM" as const,
    user_metadata: {
      full_name: "أحمد الشناوي",
      role: "GM",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "admin@nilenexus.com",
    role: "ADMIN" as const,
    user_metadata: {
      full_name: "سارة عبد الرحمن",
      role: "ADMIN",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
  sales: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "sales@nilenexus.com",
    role: "SALES" as const,
    user_metadata: {
      full_name: "كريم فهمي",
      role: "SALES",
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
};
