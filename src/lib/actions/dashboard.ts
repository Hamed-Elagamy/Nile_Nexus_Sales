"use server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  demoClients,
  demoDeals,
  demoFollowUps,
  demoPotentialClients,
} from "@/lib/demo-data";
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
    if (!isSupabaseConfigured()) {
      const openDeals = demoDeals.filter(
        (d) => d.stage !== "WON" && d.stage !== "LOST"
      );
      const totalPipelineValue = openDeals.reduce(
        (sum, d) => sum + (Number(d.estimated_value) || 0),
        0
      );
      const wonDeals = demoDeals.filter((d) => d.stage === "WON");
      const wonDealsValue = wonDeals.reduce(
        (sum, d) => sum + (Number(d.final_value || d.estimated_value) || 0),
        0
      );

      const recentActivities: DashboardMetrics["recentActivities"] = [
        {
          id: "act-01",
          type: "PROPOSAL",
          actor_id: "00000000-0000-0000-0000-000000000003",
          client_id: "c-001",
          deal_id: "d-001",
          summary: "تم اعتماد عرض السعر PROP-00101 بقيمة 520,000 ج.م لشركة النيل للمقاولات",
          notes: null,
          metadata: null,
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          client: { id: "c-001", name: "شركة النيل للمقاولات والتجارة" },
          deal: { id: "d-001", title: "ميكنة إدارة المبيعات لشركة النيل للمقاولات" },
          actor: { full_name: "كريم فهمي" },
        },
        {
          id: "act-02",
          type: "FOLLOW_UP",
          actor_id: "00000000-0000-0000-0000-000000000004",
          client_id: "c-002",
          deal_id: "d-002",
          summary: "مكالمة هاتفية مع أ. هاني عبد السلام لمراجعة العرض المالي المعدل",
          notes: null,
          metadata: null,
          created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          client: { id: "c-002", name: "القاهرة للصناعات الغذائية والتعبئة" },
          deal: { id: "d-002", title: "نظام إدارة الموزعين ومندوبي القاهرة الغذائية" },
          actor: { full_name: "مصطفى كمال" },
        },
        {
          id: "act-03",
          type: "STAGE_CHANGE",
          actor_id: "00000000-0000-0000-0000-000000000003",
          client_id: "c-003",
          deal_id: "d-003",
          summary: "تم نقل صفقة منصة شركة تبارك إلى مرحلة المفاوضات",
          notes: null,
          metadata: null,
          created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          client: { id: "c-003", name: "تبارك للاستثمار والتطوير العقاري" },
          deal: { id: "d-003", title: "باقة المنصة السحابية المتكاملة لشركة تبارك" },
          actor: { full_name: "كريم فهمي" },
        },
      ];

      const recentDeals = demoDeals.slice(0, 5).map((d) => {
        const client = demoClients.find((c) => c.id === d.client_id);
        return {
          id: d.id,
          title: d.title,
          business_id: d.business_id,
          stage: d.stage,
          estimated_value: d.estimated_value,
          currency: d.currency,
          created_at: d.created_at,
          client: client ? { id: client.id, name: client.name } : null,
        };
      });

      return {
        success: true,
        data: {
          potentialClientsCount: demoPotentialClients.length,
          activeClientsCount: demoClients.length,
          openDealsCount: openDeals.length,
          totalPipelineValue,
          wonDealsCount: wonDeals.length,
          wonDealsValue,
          todayFollowUpsCount: demoFollowUps.filter(
            (f) => f.status === "PENDING" && f.id !== "flw-003"
          ).length,
          overdueFollowUpsCount: demoFollowUps.filter((f) => f.id === "flw-003").length,
          recentActivities,
          recentDeals,
        },
      };
    }

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
