import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Users,
  Search,
  Briefcase,
  Trophy,
  PhoneCall,
  AlertCircle,
  Plus,
  Building2,
  FileText,
  Activity as ActivityIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/actions/dashboard";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "لوحة التحكم | Nile Nexus Sales",
  description: "لوحة مؤشرات الأداء ومتابعة المبيعات والصفقات",
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "Mohamed Hamed";

  const metricsRes = await getDashboardMetrics();
  const metrics = metricsRes.success && metricsRes.data ? metricsRes.data : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>{t("greeting", { name: displayName })}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/potential-clients"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>{t("searchClients")}</span>
          </Link>

          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>{t("newDeal")}</span>
          </Link>

          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-95 transition-opacity"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t("newProposal")}</span>
          </Link>
        </div>
      </div>

      {/* Overdue Alert Banner if Any */}
      {metrics && metrics.overdueFollowUpsCount > 0 && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                {t("overdueAlertTitle", { count: metrics.overdueFollowUpsCount })}
              </h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                {t("overdueAlertDesc")}
              </p>
            </div>
          </div>

          <Link
            href="/follow-ups"
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            {t("reviewOverdue")}
          </Link>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Pipeline Value */}
        <Link href="/pipeline" className="group">
          <Card className="p-5 bg-card border-border hover:border-primary/50 transition-all shadow-sm space-y-2 h-full">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">{t("openPipeline")}</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              {metrics?.totalPipelineValue.toLocaleString() || 0}{" "}
              <span className="text-xs font-sans font-medium text-muted-foreground">EGP</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("openDealsDesc", { count: metrics?.openDealsCount || 0 })}
            </p>
          </Card>
        </Link>

        {/* Closed Won Deals */}
        <Link href="/deals" className="group">
          <Card className="p-5 bg-card border-border hover:border-emerald-500/50 transition-all shadow-sm space-y-2 h-full">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">{t("wonDeals")}</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {metrics?.wonDealsValue.toLocaleString() || 0}{" "}
              <span className="text-xs font-sans font-medium text-muted-foreground">EGP</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("wonDealsDesc", { count: metrics?.wonDealsCount || 0 })}
            </p>
          </Card>
        </Link>

        {/* Today's Follow-ups */}
        <Link href="/follow-ups" className="group">
          <Card className="p-5 bg-card border-border hover:border-amber-500/50 transition-all shadow-sm space-y-2 h-full">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">{t("todayFollowUps")}</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <PhoneCall className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              {metrics?.todayFollowUpsCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("todayFollowUpsDesc")}
            </p>
          </Card>
        </Link>

        {/* Confirmed Clients */}
        <Link href="/clients" className="group">
          <Card className="p-5 bg-card border-border hover:border-purple-500/50 transition-all shadow-sm space-y-2 h-full">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">{t("activeClients")}</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-foreground">
              {metrics?.activeClientsCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("activeClientsDesc", { count: metrics?.potentialClientsCount || 0 })}
            </p>
          </Card>
        </Link>
      </div>

      {/* Two Column Layout: Recent Deals & Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>{t("recentDeals")}</span>
            </CardTitle>
            <Link
              href="/deals"
              className="text-xs text-primary hover:underline font-medium"
            >
              {tCommon("viewAll")}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!metrics?.recentDeals || metrics.recentDeals.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t("noRecentDeals")}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {metrics.recentDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors block"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <p className="text-xs font-bold text-foreground truncate">
                        {deal.title}
                      </p>
                      {deal.client && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3" />
                          <span>{deal.client.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-end space-y-1 shrink-0">
                      <DealStageBadge stage={deal.stage} />
                      <p className="text-xs font-mono font-bold text-foreground">
                        {Number(deal.estimated_value || 0).toLocaleString()} {deal.currency}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Feed */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-primary" />
              <span>{t("liveActivities")}</span>
            </CardTitle>
            <Link
              href="/follow-ups"
              className="text-xs text-primary hover:underline font-medium"
            >
              {tCommon("viewAll")}
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!metrics?.recentActivities || metrics.recentActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t("noActivities")}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {metrics.recentActivities.map((act) => {
                  const dateStr = new Date(act.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={act.id} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {act.summary}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {dateStr}
                        </span>
                      </div>

                      {act.notes && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {act.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                        {act.actor && <span>{t("by", { name: act.actor.full_name })}</span>}
                        {act.client && (
                          <Link
                            href={`/clients/${act.client.id}`}
                            className="text-primary hover:underline"
                          >
                            • {act.client.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
