import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const configured = isSupabaseConfigured();
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  let dbStatus = "not_attempted";
  let count = 0;
  let errorMsg = null;

  try {
    const supabase = await createClient();
    const { data, error, count: c } = await supabase.from("profiles").select("*", { count: "exact" });
    if (error) {
      dbStatus = "error: " + error.message;
      errorMsg = error;
    } else {
      dbStatus = "connected";
      count = c || (data ? data.length : 0);
    }
  } catch (err: any) {
    dbStatus = "exception: " + err.message;
  }

  return NextResponse.json({
    configured,
    urlPrefix: url ? url.substring(0, 15) : "none",
    keyLength: key ? key.length : 0,
    dbStatus,
    count,
    errorMsg,
  });
}
