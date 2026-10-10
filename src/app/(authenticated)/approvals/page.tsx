import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Check, X, AlertTriangle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "مركز الموافقات | Nile Nexus Sales",
  description: "إدارة واعتماد الخصومات الاستثنائية وتسهيلات السداد",
};

interface ApprovalItem {
  id: string;
  approval_type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  requester?: { full_name: string } | null;
}

export default async function ApprovalsPage() {
  const t = await getTranslations("approvals");

  const supabase = await createClient();
  const { data: dbApprovals } = await supabase
    .from("approvals")
    .select(`
      id, approval_type, status, rejection_reason, metadata, created_at,
      requester:profiles!requested_by(full_name)
    `)
    .order("created_at", { ascending: false });

  const approvals: ApprovalItem[] = (dbApprovals as unknown as ApprovalItem[]) || [];

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
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
          <p className="font-semibold">{t("policyTitle")}</p>
          <p>{t("policyDesc")}</p>
        </div>
      </div>

      {/* Approvals List or Empty State */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-2xl bg-[var(--card)] space-y-3">
            <ShieldCheck className="h-10 w-10 text-[var(--muted-foreground)] mx-auto opacity-40" />
            <h3 className="font-semibold text-base text-[var(--foreground)]">{t("noApprovals")}</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">{t("noApprovalsDesc")}</p>
          </div>
        ) : (
          approvals.map((appr) => {
            const meta = appr.metadata || {};
            const clientName = meta.client_name || "—";
            const dealValue = meta.amount ? `${Number(meta.amount).toLocaleString()} EGP` : "—";
            const requestedDiscount = meta.requested_discount || meta.discount || "—";
            const justification = meta.reason || appr.rejection_reason || "—";
            const title = meta.title || appr.approval_type;

            return (
              <div
                key={appr.id}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4 hover:border-[var(--primary)]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="h-4 w-4 text-[var(--primary)]" />
                    <h3 className="font-bold text-base text-[var(--foreground)]">
                      {title}
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
                      {t(`status.${appr.status}` as any)}
                    </Badge>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t("requestedBy")}: {appr.requester?.full_name || "—"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-[var(--muted)]/40 p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] block">{t("client")}</span>
                    <span className="font-medium text-[var(--foreground)]">{clientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] block">{t("dealValue")}</span>
                    <span className="font-medium text-[var(--foreground)]">{dealValue}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] block">{t("discountPercent")}</span>
                    <span className="font-bold text-[var(--primary)]">{requestedDiscount}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {t("justification")}:
                  </span>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                    {justification}
                  </p>
                </div>

                {appr.status === "PENDING" ? (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <X className="h-4 w-4 me-1" />
                      {t("reject")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Check className="h-4 w-4 me-1" />
                      {t("approve")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t("approvedSuccess")}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
