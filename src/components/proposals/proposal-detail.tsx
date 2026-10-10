"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Clock,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  CopyPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { ProposalPrintView } from "./proposal-print-view";
import {
  updateProposalVersionStatus,
  createProposalVersion,
  type ProposalWithRelations,
} from "@/lib/actions/proposals";
import type { ProposalStatus } from "@/lib/schemas/proposal";

interface ProposalDetailProps {
  proposal: ProposalWithRelations;
}

export function ProposalDetail({ proposal }: ProposalDetailProps) {
  const router = useRouter();
  const t = useTranslations("proposals");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const versions = proposal.versions || [];
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ""
  );

  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const activeVersion =
    versions.find((v) => v.id === selectedVersionId) || versions[0] || null;

  const handleUpdateStatus = (newStatus: ProposalStatus) => {
    if (!activeVersion) return;

    startTransition(async () => {
      const res = await updateProposalVersionStatus({
        version_id: activeVersion.id,
        status: newStatus,
      });

      if (res.success) {
        toast.success(t("statusUpdatedToast", { status: newStatus }));
        router.refresh();
      } else {
        toast.error(res.error || t("statusUpdateFailed"));
      }
    });
  };

  const handleCreateNewVersion = () => {
    if (!activeVersion) return;

    startTransition(async () => {
      const res = await createProposalVersion({
        proposal_id: proposal.id,
        items: activeVersion.items.map((it, idx) => ({
          service_id: it.service_id,
          description_ar: it.description_ar,
          description_en: it.description_en,
          quantity: it.quantity,
          unit_price: Number(it.unit_price),
          sort_order: idx,
        })),
        currency: activeVersion.currency,
        discount_percentage: activeVersion.discount_percentage
          ? Number(activeVersion.discount_percentage)
          : undefined,
        discount_amount: Number(activeVersion.discount_amount),
        tax_percentage: 14,
        delivery_duration: activeVersion.delivery_duration,
        payment_terms: activeVersion.payment_terms,
        terms_and_conditions: activeVersion.terms_and_conditions,
        notes: t("newVersionNote", { version: activeVersion.version_number }),
      });

      if (res.success && res.data) {
        toast.success(t("newVersionSuccess"));
        setSelectedVersionId(res.data.id);
        router.refresh();
      } else {
        toast.error(res.error || t("newVersionFailed"));
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/proposals"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span>{t("backToList")}</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {proposal.business_id}
              </h1>
              {activeVersion && (
                <ProposalStatusBadge status={activeVersion.status} />
              )}
              <Badge variant="outline" className="text-xs font-mono">
                {t("versionBadge", { version: activeVersion?.version_number || 1 })}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {activeVersion && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPrintOpen(true)}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>{t("previewAndPrint")}</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateNewVersion}
              disabled={isPending}
              className="gap-1.5"
              title={t("newVersionTooltip")}
            >
              <CopyPlus className="h-4 w-4" />
              <span>{t("newVersion")}</span>
            </Button>

            {/* Lifecycle Transitions */}
            {activeVersion && activeVersion.status === "DRAFT" && (
              <Button
                size="sm"
                onClick={() => handleUpdateStatus("READY")}
                disabled={isPending}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{t("approveToSend")}</span>
              </Button>
            )}

            {activeVersion &&
              (activeVersion.status === "READY" || activeVersion.status === "DRAFT") && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus("SENT")}
                  disabled={isPending}
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send className="h-4 w-4" />
                  <span>{t("confirmSent")}</span>
                </Button>
              )}

            {activeVersion && activeVersion.status === "SENT" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus("ACCEPTED")}
                  disabled={isPending}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("clientAccepted")}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={isPending}
                  className="gap-1.5 text-rose-600 hover:bg-rose-500/10"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{t("rejectProposal")}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Versions Tab Selector */}
        {versions.length > 1 && (
          <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {t("versionHistory")}
            </span>
            {versions.map((ver) => (
              <button
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                  ver.id === selectedVersionId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                v{ver.version_number} ({ver.status})
              </button>
            ))}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span>{t("clientLabel")}</span>
            </div>
            {proposal.client ? (
              <Link
                href={`/clients/${proposal.client.id}`}
                className="text-base font-bold text-foreground hover:text-primary transition-colors"
              >
                {proposal.client.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">{tCommon("notSpecified")}</span>
            )}
            {proposal.client?.phone && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {proposal.client.phone}
              </p>
            )}
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Briefcase className="h-4 w-4" />
              <span>{t("linkedDealLabel")}</span>
            </div>
            {proposal.deal ? (
              <Link
                href={`/deals/${proposal.deal.id}`}
                className="text-base font-bold text-foreground hover:text-primary transition-colors"
              >
                {proposal.deal.title}
              </Link>
            ) : (
              <span className="text-muted-foreground">{tCommon("notSpecified")}</span>
            )}
            {proposal.deal?.business_id && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {proposal.deal.business_id}
              </p>
            )}
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span>{t("totalDue")}</span>
            </div>
            <p className="text-xl font-black text-primary font-mono">
              {Number(activeVersion?.grand_total || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              {activeVersion?.currency || "EGP"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("includesTax")}
            </p>
          </Card>
        </div>

        {/* Line Items Table */}
        {activeVersion && (
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border py-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{t("itemsHeader", { version: activeVersion.version_number })}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {t("itemsCount", { count: activeVersion.items.length })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-muted/20 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-3 w-10 text-center">{t("tableNumber")}</th>
                      <th className="p-3">{t("tableDescription")}</th>
                      <th className="p-3 w-24 text-center">{t("tableQuantity")}</th>
                      <th className="p-3 w-32 text-center">{t("tableUnitPrice")}</th>
                      <th className="p-3 w-32 text-left">{t("tableTotal")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeVersion.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-3 text-center text-muted-foreground font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          {item.description_ar}
                          {item.description_en && (
                            <span className="block text-[11px] text-muted-foreground">
                              {item.description_en}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-center font-mono">
                          {Number(item.unit_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-left font-mono font-semibold">
                          {Number(item.subtotal).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}{" "}
                          {activeVersion.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commercial Terms & Conditions */}
        {activeVersion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 space-y-3 bg-card border-border text-xs">
              <h4 className="font-semibold text-foreground">{t("termsTitle")}</h4>
              <div className="space-y-2 text-muted-foreground">
                {activeVersion.delivery_duration && (
                  <div>
                    <span className="font-bold text-foreground">{t("deliveryDuration")}{" "}</span>
                    {activeVersion.delivery_duration}
                  </div>
                )}
                {activeVersion.payment_terms && (
                  <div>
                    <span className="font-bold text-foreground">{t("paymentTerms")}{" "}</span>
                    {activeVersion.payment_terms}
                  </div>
                )}
                {activeVersion.valid_until && (
                  <div>
                    <span className="font-bold text-foreground">{t("validUntil")}{" "}</span>
                    {activeVersion.valid_until}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 space-y-3 bg-muted/40 border-border text-xs">
              <h4 className="font-semibold text-foreground">{t("summaryTitle")}</h4>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span className="font-mono text-foreground font-medium">
                    {Number(activeVersion.subtotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {activeVersion.currency}
                  </span>
                </div>
                {Number(activeVersion.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t("discount")}</span>
                    <span className="font-mono">
                      -{" "}
                      {Number(activeVersion.discount_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {activeVersion.currency}
                    </span>
                  </div>
                )}
                {Number(activeVersion.tax_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>{t("vat")}</span>
                    <span className="font-mono text-foreground font-medium">
                      +{" "}
                      {Number(activeVersion.tax_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {activeVersion.currency}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
                  <span>{t("grandTotal")}</span>
                  <span className="font-mono text-base text-primary">
                    {Number(activeVersion.grand_total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {activeVersion.currency}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Printable Quotation Modal */}
      {isPrintOpen && activeVersion && (
        <ProposalPrintView
          proposal={proposal}
          version={activeVersion}
          onClose={() => setIsPrintOpen(false)}
        />
      )}
    </>
  );
}
