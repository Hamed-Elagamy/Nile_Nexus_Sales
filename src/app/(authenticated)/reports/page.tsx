import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrendingUp, Award, Download, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التقارير والتحليلات | Nile Nexus Sales",
  description: "مؤشرات الأداء التجاري وتحليلات بايبلاين المبيعات",
};

export default async function ReportsPage() {
  const t = await getTranslations("reports");

  const supabase = await createClient();

  const [wonDealsRes, openDealsRes, potentialRes, repsRes] = await Promise.all([
    supabase.from("deals").select("id, final_value, estimated_value, sales_owner_id").eq("stage", "WON").is("archived_at", null),
    supabase.from("deals").select("id, stage, estimated_value, sales_owner_id").is("archived_at", null).not("stage", "in", '("WON","LOST")'),
    supabase.from("potential_clients").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("profiles").select("id, full_name, email").eq("is_active", true),
  ]);

  const wonDeals = wonDealsRes.data || [];
  const openDeals = openDealsRes.data || [];
  const reps = repsRes.data || [];
  const potentialCount = potentialRes.count || 0;

  const closedRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.final_value || d.estimated_value) || 0), 0);
  const openPipeline = openDeals.reduce((sum, d) => sum + (Number(d.estimated_value) || 0), 0);
  const totalDealsCount = wonDeals.length + openDeals.length;
  const avgDealSize = totalDealsCount > 0 ? Math.round((closedRevenue + openPipeline) / totalDealsCount) : 0;
  const overallConversion = (potentialCount + totalDealsCount) > 0 
    ? Math.round((wonDeals.length / Math.max(1, potentialCount + totalDealsCount)) * 100) 
    : 0;

  // Build performance per rep
  const repsPerformance = reps.map((r) => {
    const repWon = wonDeals.filter((d) => d.sales_owner_id === r.id);
    const repOpen = openDeals.filter((d) => d.sales_owner_id === r.id);
    const repWonSum = repWon.reduce((sum, d) => sum + (Number(d.final_value || d.estimated_value) || 0), 0);
    const repOpenSum = repOpen.reduce((sum, d) => sum + (Number(d.estimated_value) || 0), 0);
    const totalRepDeals = repWon.length + repOpen.length;
    const rate = totalRepDeals > 0 ? Math.round((repWon.length / totalRepDeals) * 100) : 0;

    return {
      name: r.full_name || r.email.split("@")[0],
      dealsWon: repWon.length,
      revenueWon: `${repWonSum.toLocaleString()} EGP`,
      openPipeline: `${repOpenSum.toLocaleString()} EGP`,
      rate: `${rate}%`,
      rawWon: repWonSum,
    };
  }).sort((a, b) => b.rawWon - a.rawWon);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>{t("exportExcel")}</span>
        </Button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("closedRevenue")}</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {closedRevenue.toLocaleString()} EGP
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">{t("monthlyTarget")}</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("openPipeline")}</span>
          <p className="text-2xl font-bold text-[var(--primary)] mt-2">
            {openPipeline.toLocaleString()} EGP
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">{openDeals.length} {t("deals")}</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("avgDealSize")}</span>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">
            {avgDealSize.toLocaleString()} EGP
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">{t("enterpriseSegment")}</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">{t("overallConversion")}</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {overallConversion}%
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">{t("conversionDesc")}</span>
        </div>
      </div>

      {/* Sales Funnel Analysis & Reps Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {t("funnelTitle")}
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{t("funnelStages.pool")}</span>
                <span>{potentialCount}</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: potentialCount > 0 ? "100%" : "0%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{t("funnelStages.contacted")}</span>
                <span>{openDeals.filter((d) => d.stage === "CONTACTED" || d.stage === "INTERESTED").length}</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: totalDealsCount > 0 ? "75%" : "0%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{t("funnelStages.proposals")}</span>
                <span>{openDeals.filter((d) => d.stage === "PROPOSAL_SENT" || d.stage === "NEGOTIATION").length}</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: totalDealsCount > 0 ? "50%" : "0%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{t("funnelStages.won")}</span>
                <span>{wonDeals.length}</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: wonDeals.length > 0 ? "25%" : "0%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Reps Leaderboard */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {t("teamLeaderboard")}
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            {repsPerformance.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
                <BarChart2 className="h-8 w-8 text-[var(--muted-foreground)] mx-auto opacity-40" />
                <p className="text-sm font-semibold text-[var(--foreground)]">{t("noReps")}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t("noRepsDesc")}</p>
              </div>
            ) : (
              repsPerformance.map((rep, idx) => (
                <div
                  key={rep.name}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--foreground)]">
                        {rep.name}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {t("revenueWon")}: {rep.revenueWon} • {t("dealsWon")}: {rep.dealsWon}
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className="text-sm font-bold text-[var(--primary)] block">
                      {rep.openPipeline}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {t("activePipeline")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
