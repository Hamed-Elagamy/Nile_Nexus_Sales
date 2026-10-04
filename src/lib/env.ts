import { z } from "zod";

/**
 * Server-side environment variables validation.
 * Validates at build/startup time that all required env vars are set.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key required"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Client-side environment variables validation.
 * Only NEXT_PUBLIC_ prefixed variables are available in the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["ar", "en"]).default("ar"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate environment variables.
 * Call this during application startup to fail fast on misconfiguration.
 */
export function validateEnv(): { server: ServerEnv; client: ClientEnv } {
  const server = serverEnvSchema.safeParse(process.env);
  const client = clientEnvSchema.safeParse(process.env);

  if (!server.success) {
    console.error(
      "❌ Invalid server environment variables:",
      server.error.flatten().fieldErrors
    );
    // Don't throw in development if Supabase isn't configured yet
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid server environment variables");
    }
  }

  if (!client.success) {
    console.error(
      "❌ Invalid client environment variables:",
      client.error.flatten().fieldErrors
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid client environment variables");
    }
  }

  return {
    server: server.data ?? ({} as ServerEnv),
    client: client.data ?? ({} as ClientEnv),
  };
}
