import { Metadata } from "next";
import { ShieldCheck, Check, X, AlertTriangle, FileText } from "lucide-react";
import { demoApprovals } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "مركز الموافقات | Nile Nexus Sales",
  description: "إدارة واعتماد الخصومات الاستثنائية وتسهيلات السداد",
};

export default function ApprovalsPage() {
  const approvals = demoApprovals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            مركز الموافقات والاعتمادات
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            صلاحيات الإدارة العامة (GM) والمشرفين لاعتماد الخصومات الخاصة وشروط التعاقد
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
          <p className="font-semibold">سياسة الخصومات المؤسسية:</p>
          <p>
            تتطلب أي نسبة خصم تتجاوز 5% أو عروض تقسيط غير قياسية موافقة خطية مباشرة من المدير العام (GM) لحماية الهوامش الربحية للشركة.
          </p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((appr) => (
          <div
            key={appr.id}
            className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4 hover:border-[var(--primary)]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  {appr.title}
                </h3>
                <Badge
                  variant={
                    appr.status === "PENDING"
                      ? "outline"
                      : appr.status === "APPROVED"
                      ? "default"
                      : "destructive"
                  }
                >
                  {appr.status === "PENDING"
                    ? "قيد الانتظار"
                    : appr.status === "APPROVED"
                    ? "معتمد ✅"
                    : "مرفوض ❌"}
                </Badge>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                مقدم الطلب: {appr.requester_name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-[var(--muted)]/40 p-3 rounded-xl">
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block">العميل</span>
                <span className="font-medium text-[var(--foreground)]">{appr.client_name}</span>
              </div>
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block">قيمة الصفقة الإجمالية</span>
                <span className="font-medium text-[var(--foreground)]">{appr.amount}</span>
              </div>
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block">الخصم / التسهيل المطلوب</span>
                <span className="font-bold text-[var(--primary)]">{appr.requested_discount}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                المبرر التجاري وتفاصيل التفاوض:
              </span>
              <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                {appr.reason}
              </p>
            </div>

            {appr.status === "PENDING" ? (
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <X className="h-4 w-4 me-1" />
                  رفض الطلب
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Check className="h-4 w-4 me-1" />
                  اعتماد وموافقة
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                <ShieldCheck className="h-4 w-4" />
                <span>تم اعتماد هذا الإجراء من قبل الإدارة العامة وحفظه في سجل التدقيق.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
