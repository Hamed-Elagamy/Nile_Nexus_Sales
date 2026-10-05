import { Metadata } from "next";
import { TrendingUp, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "التقارير والتحليلات | Nile Nexus Sales",
  description: "مؤشرات الأداء التجاري وتحليلات بايبلاين المبيعات",
};

export default function ReportsPage() {
  const repsPerformance = [
    { name: "كريم فهمي", dealsWon: 1, revenueWon: "520,000 ج.م", openPipeline: "930,000 ج.م", rate: "78%" },
    { name: "مصطفى كمال", dealsWon: 0, revenueWon: "0 ج.م", openPipeline: "545,000 ج.م", rate: "65%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            التقارير ومؤشرات الأداء (BI Analytics)
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            تحليلات الإيرادات المحققة، نسب التحويل، وأداء فريق المبيعات الشهري
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>تصدير تقرير الإكسيل (Excel)</span>
        </Button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">إجمالي المبيعات المغلقة (Q1)</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            520,000 ج.م
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">104% من الهدف الشهري</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">قيمة البايبلاين المفتوح النشط</span>
          <p className="text-2xl font-bold text-[var(--primary)] mt-2">
            1,475,000 ج.م
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">4 صفقات قيد التفاوض والعروض</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">متوسط قيمة الصفقة (Deal Size)</span>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-2">
            399,000 ج.م
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">للقطاع المؤسسي والشركات</span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <span className="text-xs text-[var(--muted-foreground)]">معدل تحويل العروض (Win Rate)</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            50%
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">1 كسبت من أصل 2 عرض سعر</span>
        </div>
      </div>

      {/* Sales Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              قمع تحويل المبيعات (Sales Funnel)
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>العملاء المحتملين المؤهلين (Leads Pool)</span>
                <span>4 عملاء (100%)</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>تواصل واجتماعات استكشافية (Contacted & Meetings)</span>
                <span>3 عملاء (75%)</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-3/4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>عروض أسعار رسمية ومفاوضات (Proposals Sent)</span>
                <span>2 عرض (50%)</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>صفقات رابحة ومعتمدة (Deals Won)</span>
                <span>1 صفقة (25%)</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-1/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Reps Leaderboard */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              أداء مسؤولي المبيعات (Leaderboard)
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            {repsPerformance.map((rep, idx) => (
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
                      المحقق: {rep.revenueWon} • الصفقات: {rep.dealsWon}
                    </p>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-sm font-bold text-[var(--primary)] block">
                    {rep.openPipeline}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    بايبلاين نشط
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
