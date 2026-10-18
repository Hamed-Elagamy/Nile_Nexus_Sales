"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updateDealStage } from "@/lib/actions/deals";
import { cn } from "@/lib/utils";

interface LostDealDialogProps {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type LossReasonKey =
  | "price_budget"
  | "competitor"
  | "postponed"
  | "ghosted"
  | "tech_mismatch"
  | "other";

const LOSS_REASONS: { key: LossReasonKey; label_ar: string; icon: string }[] = [
  { key: "price_budget", label_ar: "السعر أعلى من الميزانية", icon: "💸" },
  { key: "competitor", label_ar: "التعاقد مع منافس", icon: "🏢" },
  { key: "postponed", label_ar: "تأجيل المشروع داخلياً", icon: "⏸️" },
  { key: "ghosted", label_ar: "انقطاع التواصل والرد", icon: "👻" },
  { key: "tech_mismatch", label_ar: "عدم تطابق المواصفات", icon: "🛠️" },
  { key: "other", label_ar: "أسباب أو ظروف أخرى", icon: "📝" },
];

export function LostDealDialog({
  dealId,
  open,
  onOpenChange,
  onSuccess,
}: LostDealDialogProps) {
  const tDeals = useTranslations("deals.lostDialog");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [selectedReason, setSelectedReason] = useState<LossReasonKey>("price_budget");
  const [competitorName, setCompetitorName] = useState("");
  const [clientBudget, setClientBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [resurfaceDate, setResurfaceDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const applyResurfacePreset = (months: number) => {
    const target = new Date();
    target.setMonth(target.getMonth() + months);
    setResurfaceDate(target.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId) return;

    const reasonObj = LOSS_REASONS.find((r) => r.key === selectedReason);
    const structuredPrefix = [
      `[السبب الرئيسي: ${reasonObj?.label_ar || selectedReason}]`,
      competitorName.trim() ? `[المنافس: ${competitorName.trim()}]` : null,
      clientBudget.trim() ? `[ميزانية العميل: ${clientBudget.trim()} ج.م]` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const fullNotes = `${structuredPrefix}\n${notes.trim()}`.trim();

    setError(null);
    startTransition(async () => {
      const res = await updateDealStage({
        deal_id: dealId,
        stage: "LOST",
        lost_notes: fullNotes,
        resurface_date: resurfaceDate || undefined,
      });

      if (!res.success) {
        setError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      toast.info(tDeals("successToast"));
      onOpenChange(false);
      setNotes("");
      setCompetitorName("");
      setClientBudget("");
      setResurfaceDate("");
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
            <span>تسجيل خسارة الصفقة والتحليل التشخيصي (Post-Mortem)</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Structured Reason Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-foreground block">
              السبب الرئيسي لخسارة الصفقة <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOSS_REASONS.map((r) => {
                const isSelected = selectedReason === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedReason(r.key)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-start transition-all",
                      isSelected
                        ? "border-rose-500/70 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold ring-1 ring-rose-500/30"
                        : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="truncate">{r.label_ar}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Sub-fields */}
          {selectedReason === "competitor" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>اسم الشركة المنافسة (لو معروف)</span>
              </label>
              <Input
                placeholder="مثال: شركة س ص للبرمجيات"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                className="text-xs bg-background"
              />
            </div>
          )}

          {selectedReason === "price_budget" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                <span>ميزانية العميل القصوى المتوقعة (ج.م)</span>
              </label>
              <Input
                type="number"
                placeholder="مثال: 75000"
                value={clientBudget}
                onChange={(e) => setClientBudget(e.target.value)}
                className="text-xs bg-background"
              />
            </div>
          )}

          {/* Detailed Observations / Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              ملاحظات وتفاصيل إضافية / دروس مستفادة <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="سجل أسباب العميل، أي اعتراضات لم يتم تجاوزها، أو توصيات للمبيعات القادمة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              required
              className="text-xs"
            />
          </div>

          {/* Smart Resurface Date with Presets */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>تاريخ إعادة التنشيط والمتابعة التلقائية</span>
              </label>
              <span className="text-[11px] text-muted-foreground">تنبيه مستقبلي لإحياء الصفقة</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyResurfacePreset(1)}
                className="text-[11px] h-7 px-2"
              >
                +1 شهر
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyResurfacePreset(3)}
                className="text-[11px] h-7 px-2 border-primary/40 text-primary"
              >
                +3 شهور (موصى به)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyResurfacePreset(6)}
                className="text-[11px] h-7 px-2"
              >
                +6 شهور
              </Button>
            </div>

            <Input
              type="date"
              value={resurfaceDate}
              onChange={(e) => setResurfaceDate(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !notes.trim()}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ التحليل وخسارة الصفقة</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
