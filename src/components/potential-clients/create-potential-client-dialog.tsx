"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createPotentialClient,
  checkDuplicatePotentialClient,
} from "@/lib/actions/potential-clients";
import {
  OPPORTUNITY_INDICATORS,
  type OpportunityIndicatorType,
} from "@/lib/schemas/potential-client";

interface CreatePotentialClientDialogProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreatePotentialClientDialog({
  onSuccess,
  triggerButton,
}: CreatePotentialClientDialogProps) {
  const t = useTranslations("potentialClients");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOpportunities, setSelectedOpportunities] = useState<OpportunityIndicatorType[]>([]);

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setArea("");
    setPhone("");
    setWebsite("");
    setInstagram("");
    setFacebook("");
    setNotes("");
    setSelectedOpportunities([]);
    setDuplicateWarning(null);
    setFormError(null);
  };

  const handlePhoneBlur = async () => {
    if (!phone || phone.trim().length < 7) {
      setDuplicateWarning(null);
      return;
    }
    const check = await checkDuplicatePotentialClient({ phone, name });
    if (check.isDuplicate) {
      const matchNames = check.matches.map((m) => `${m.name} (${m.business_id})`).join(", ");
      setDuplicateWarning(`العميل ده موجود عندنا بالفعل تقريبًا 👀: ${matchNames}`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const toggleOpportunity = (opp: OpportunityIndicatorType) => {
    setSelectedOpportunities((prev) =>
      prev.includes(opp) ? prev.filter((o) => o !== opp) : [...prev, opp]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("اسم العميل المحتمل مطلوب");
      return;
    }

    startTransition(async () => {
      const res = await createPotentialClient({
        name: name.trim(),
        area: area.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        notes: notes.trim() || undefined,
        opportunities: selectedOpportunities,
      });

      if (!res.success) {
        setFormError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      if (res.warning) {
        toast.warning(res.warning);
      } else {
        toast.success(t("createdSuccess"));
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          triggerButton ? (
            (triggerButton as React.ReactElement)
          ) : (
            <Button className="gap-2 bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95">
              <Plus className="h-4 w-4" />
              <span>{t("addNew")}</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{t("addNew")}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Name & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("name")} <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="مثال: CORE Coffee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("area")}
              </label>
              <Input
                placeholder="مثال: المعادي، القاهرة"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("phone")}
              </label>
              <Input
                placeholder="010XXXXXXXX"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("website")}
              </label>
              <Input
                placeholder="https://example.com"
                dir="ltr"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("instagram")}
              </label>
              <Input
                placeholder="@username"
                dir="ltr"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("facebook")}
              </label>
              <Input
                placeholder="facebook.com/page"
                dir="ltr"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>
          </div>

          {/* Opportunity Indicators */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground block">
              {t("opportunities")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OPPORTUNITY_INDICATORS.map((opp) => {
                const isSelected = selectedOpportunities.includes(opp);
                return (
                  <button
                    key={opp}
                    type="button"
                    onClick={() => toggleOpportunity(opp)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-center flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <span>{t(`indicators.${opp}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-foreground">
              {t("notes")}
            </label>
            <Textarea
              placeholder="اكتب كل الملاحظات اللي عرفتها عن العميل ونشاطه..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{tCommon("save")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
