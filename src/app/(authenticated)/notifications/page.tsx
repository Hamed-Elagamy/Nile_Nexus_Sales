import { Metadata } from "next";
import Link from "next/link";
import { CheckCheck, AlertCircle, CheckCircle, Info } from "lucide-react";
import { demoNotifications } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "مركز الإشعارات | Nile Nexus Sales",
  description: "التنبيهات وإشعارات النظام وأحداث الصفقات",
};

export default function NotificationsPage() {
  const notifications = demoNotifications;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            مركز الإشعارات والتنبيهات
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            تنبيهات المتابعات العاجلة، تحديثات عروض الأسعار، وتعيين العملاء الجدد
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <CheckCheck className="h-4 w-4" />
          <span>تحديد الكل كمقروء</span>
        </Button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
              notif.is_read
                ? "border-[var(--border)] bg-[var(--card)] opacity-80"
                : "border-[var(--primary)]/40 bg-[var(--card)] shadow-xs"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {notif.type === "ALERT" ? (
                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
              ) : notif.type === "SUCCESS" ? (
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Info className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm text-[var(--foreground)]">
                  {notif.title}
                </h3>
                <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                  {notif.timestamp}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {notif.description}
              </p>

              {notif.link && (
                <div className="pt-2">
                  <Link
                    href={notif.link}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                  >
                    عرض التفاصيل الإجرائية ←
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
