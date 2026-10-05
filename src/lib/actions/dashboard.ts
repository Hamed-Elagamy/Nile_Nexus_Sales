"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Activity, Deal, Client } from "@/types/domain";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
};

export interface DashboardMetrics {
  potentialClientsCount: number;
  activeClientsCount: number;
  openDealsCount: number;
  totalPipelineValue: number;
  wonDealsCount: number;
  wonDealsValue: number;
  todayFollowUpsCount: number;
  overdueFollowUpsCount: number;
  recentActivities: Array<
    Activity & {
      client?: Pick<Client, "id" | "name"> | null;
      deal?: Pick<Deal, "id" | "title"> | null;
      actor?: { full_name: string } | null;
    }
  >;
  recentDeals: Array<
    Pick<Deal, "id" | "title" | "business_id" | "stage" | "estimated_value" | "currency" | "created_at"> & {
      client?: Pick<Client, "id" | "name"> | null;
    }
  >;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

/**
 * Fetch all executive KPI metrics and recent activities for the dashboard
 */
export async function getDashboardMetrics(): Promise<ActionResult<DashboardMetrics>> {
  try {
    const supabase = await createSupabaseServerClient();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const [
      potentialCountRes,
      clientsCountRes,
      openDealsRes,
      wonDealsRes,
      todayFollowUpsRes,
      overdueFollowUpsRes,
      recentActivitiesRes,
      recentDealsRes,
    ] = await Promise.all([
      supabase.from("potential_clients").select("*", { count: "exact", head: true }).is("archived_at", null),
      supabase.from("clients").select("*", { count: "exact", head: true }).is("archived_at", null),
      supabase
        .from("deals")
        .select("estimated_value")
        .is("archived_at", null)
        .not("stage", "in", '("WON","LOST")'),
      supabase
        .from("deals")
        .select("final_value")
        .is("archived_at", null)
        .eq("stage", "WON"),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING")
        .gte("due_at", startOfToday)
        .lte("due_at", endOfToday),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING")
        .lt("due_at", startOfToday),
      supabase
        .from("activities")
        .select(
          `
          *,
          client:clients!client_id(id, name),
          deal:deals!deal_id(id, title),
          actor:profiles!actor_id(full_name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("deals")
        .select(
          `
          id, title, business_id, stage, estimated_value, currency, created_at,
          client:clients!client_id(id, name)
        `
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Calculate total pipeline value
    const openDealsData = openDealsRes.data || [];
    const totalPipelineValue = openDealsData.reduce(
      (sum, d) => sum + (Number(d.estimated_value) || 0),
      0
    );

    // Calculate won deals value
    const wonDealsData = wonDealsRes.data || [];
    const wonDealsValue = wonDealsData.reduce(
      (sum, d) => sum + (Number(d.final_value) || 0),
      0
    );

    return {
      success: true,
      data: {
        potentialClientsCount: potentialCountRes.count || 0,
        activeClientsCount: clientsCountRes.count || 0,
        openDealsCount: openDealsData.length,
        totalPipelineValue,
        wonDealsCount: wonDealsData.length,
        wonDealsValue,
        todayFollowUpsCount: todayFollowUpsRes.count || 0,
        overdueFollowUpsCount: overdueFollowUpsRes.count || 0,
        recentActivities: (recentActivitiesRes.data || []) as unknown as DashboardMetrics["recentActivities"],
        recentDeals: (recentDealsRes.data || []) as unknown as DashboardMetrics["recentDeals"],
      },
    };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, "Failed to load dashboard metrics") };
  }
}
