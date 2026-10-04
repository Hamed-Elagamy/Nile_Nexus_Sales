import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {t("greeting", { name: "👤" })}
        </h1>
        <p className="text-[var(--muted-foreground)]">{t("subtitle")}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title={t("followUpsToday")}
          value="0"
          className="border-blue-200 dark:border-blue-800"
        />
        <DashboardCard
          title={t("overdue")}
          value="0"
          className="border-red-200 dark:border-red-800"
        />
        <DashboardCard
          title={t("openDeals")}
          value="0"
          className="border-amber-200 dark:border-amber-800"
        />
        <DashboardCard
          title={t("wonThisMonth")}
          value="0"
          className="border-green-200 dark:border-green-800"
        />
      </div>

      {/* Focus Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("focusTitle")}</h2>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center text-[var(--muted-foreground)]">
          <p className="text-4xl mb-2">🎯</p>
          <p>{t("noOverdue")}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--card)] rounded-xl border p-5 space-y-2 ${className}`}
    >
      <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
      <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
