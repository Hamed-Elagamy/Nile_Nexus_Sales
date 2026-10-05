"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Globe,
  Share2,
  Sparkles,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PotentialClientStatusBadge } from "./status-badge";
import {
  updatePotentialClient,
  updatePotentialClientStatus,
  type PotentialClientWithRelations,
} from "@/lib/actions/potential-clients";
import {
  OPPORTUNITY_INDICATORS,
  type OpportunityIndicatorType,
  type PotentialClientStatusType,
} from "@/lib/schemas/potential-client";

interface PotentialClientDetailProps {
  client: PotentialClientWithRelations;
}

export function PotentialClientDetail({ client }: PotentialClientDetailProps) {
  const t = useTranslations("potentialClients");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<PotentialClientStatusType>(
    client.status as PotentialClientStatusType
  );
  const [notes, setNotes] = useState(client.notes || "");
  const [opportunities, setOpportunities] = useState<OpportunityIndicatorType[]>(
    (client.opportunities as OpportunityIndicatorType[]) || []
  );

  const [convertModalOpen, setConvertModalOpen] = useState(false);

  const cleanPhone = client.phone?.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
    : null;

  const handleStatusChange = (newStatus: PotentialClientStatusType) => {
    startTransition(async () => {
      const res = await updatePotentialClientStatus(client.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        toast.success(t("statusUpdated"));
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updatePotentialClient(client.id, {
        notes,
        opportunities,
      });
      if (res.success) {
        toast.success(t("updatedSuccess"));
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  const toggleOpportunity = (opp: OpportunityIndicatorType) => {
    setOpportunities((prev) =>
      prev.includes(opp) ? prev.filter((o) => o !== opp) : [...prev, opp]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/potential-clients"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>الرجوع للعملاء المحتملين</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {client.business_id}
            </span>
            <PotentialClientStatusBadge
              status={currentStatus}
              label={t(`status.${currentStatus}`)}
            />
          </div>
          {client.area && (
            <p className="text-sm text-muted-foreground">{client.area}</p>
          )}
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentStatus !== "RESEARCHING" && currentStatus !== "CONVERTED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange("RESEARCHING")}
              className="gap-1.5 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t("statusActions.startResearch")}</span>
            </Button>
          )}

          {currentStatus !== "RESEARCHED" && currentStatus !== "CONVERTED" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusChange("RESEARCHED")}
              className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("statusActions.finishResearch")}</span>
            </Button>
          )}

          {currentStatus !== "CONVERTED" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setConvertModalOpen(true)}
              className="gap-1.5 text-xs bg-primary text-primary-foreground font-medium shadow-xs"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>{t("convert")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Info + Opportunities + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Quick Contact Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">بيانات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {client.phone ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                  <span className="font-mono text-xs" dir="ltr">{client.phone}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${client.phone}`}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="اتصال"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-600"
                        title="واتساب"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">لا يوجد رقم هاتف مسجل</p>
              )}

              {/* Online Links */}
              <div className="space-y-2 pt-1">
                {client.website && (
                  <a
                    href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="truncate">{client.website}</span>
                  </a>
                )}
                {client.instagram && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="truncate">{client.instagram}</span>
                  </div>
                )}
                {client.facebook && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="truncate">{client.facebook}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">تفاصيل البحث</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>المسؤول:</span>
                <span className="font-medium text-foreground">
                  {client.research_owner?.full_name || "غير محدد"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>تاريخ التسجيل:</span>
                <span className="font-medium text-foreground">
                  {new Date(client.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
              {client.source && (
                <div className="flex items-center justify-between">
                  <span>المصدر:</span>
                  <span className="font-medium text-foreground">
                    {client.source.name_ar}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns: Opportunities & Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunities Selector Card */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>الفرص والاحتياجات المكتشفة</span>
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                اختر المجالات اللي محتاجها العميل
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPPORTUNITY_INDICATORS.map((opp) => {
                  const isSelected = opportunities.includes(opp);
                  return (
                    <button
                      key={opp}
                      type="button"
                      onClick={() => toggleOpportunity(opp)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <span>{t(`indicators.${opp}`)}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Research Notes & Findings */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">ملاحظات ونتائج البحث</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={isPending}
                className="gap-1.5 text-xs"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>حفظ التعديلات</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="سجل كل تفاصيل البحث: معلومات عن الشركة، حجم البيزنس، المشاكل في السستم الحالي، الفرص الممكنة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="resize-y"
              />
              <p className="text-[11px] text-muted-foreground">
                الملاحظات دي هتتنقل تلقائيًا مع العميل لما يتحول لعميل رسمي 🚀
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert to Client Confirmation Dialog */}
      <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <span>🚀</span>
              <span>{t("convert")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-foreground">
            <p>{t("convertConfirm")}</p>
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-semibold text-foreground">البيانات اللي هتتنقل:</p>
              <p className="text-muted-foreground">• اسم العميل: {client.name}</p>
              {client.phone && <p className="text-muted-foreground">• رقم التواصل: {client.phone}</p>}
              <p className="text-muted-foreground">• كل الفرص والملاحظات المسجلة</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConvertModalOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => {
                setConvertModalOpen(false);
                handleStatusChange("CONVERTED");
              }}
              className="gap-2 bg-primary text-primary-foreground font-medium"
            >
              <Rocket className="h-4 w-4" />
              <span>تأكيد التحويل 🚀</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
