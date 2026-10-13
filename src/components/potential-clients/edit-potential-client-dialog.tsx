"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Pencil,
  Loader2,
  AlertCircle,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  Share2,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updatePotentialClient,
  checkDuplicatePotentialClient,
  type PotentialClientWithRelations,
} from "@/lib/actions/potential-clients";
import {
  OPPORTUNITY_INDICATORS,
  type OpportunityIndicatorType,
} from "@/lib/schemas/potential-client";

interface EditPotentialClientDialogProps {
  client: PotentialClientWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: PotentialClientWithRelations) => void;
}

export function EditPotentialClientDialog({
  client,
  open,
  onOpenChange,
  onSuccess,
}: EditPotentialClientDialogProps) {
  const t = useTranslations("potentialClients");
  const tCommon = useTranslations("common");

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(client.name || "");
  const [area, setArea] = useState(client.area || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [website, setWebsite] = useState(client.website || "");
  const [instagram, setInstagram] = useState(client.instagram || "");
  const [facebook, setFacebook] = useState(client.facebook || "");
  const [notes, setNotes] = useState(client.notes || "");
  const [selectedOpportunities, setSelectedOpportunities] = useState<OpportunityIndicatorType[]>(
    (client.opportunities as OpportunityIndicatorType[]) || []
  );

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state whenever client changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(client.name || "");
      setArea(client.area || "");
      setPhone(client.phone || "");
      setWebsite(client.website || "");
      setInstagram(client.instagram || "");
      setFacebook(client.facebook || "");
      setNotes(client.notes || "");
      setSelectedOpportunities((client.opportunities as OpportunityIndicatorType[]) || []);
      setDuplicateWarning(null);
      setFormError(null);
    }
  }, [client, open]);

  const handlePhoneBlur = async () => {
    if (!phone || phone.trim().length < 7 || phone.trim() === client.phone?.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const check = await checkDuplicatePotentialClient({ phone, name });
    // Filter out current client from duplicates
    const actualMatches = check.matches.filter((m) => m.id !== client.id);
    if (actualMatches.length > 0) {
      const matchNames = actualMatches.map((m) => `${m.name} (${m.business_id})`).join(", ");
      setDuplicateWarning(t("duplicateWarningWithMatch", { matches: matchNames }));
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
      setFormError(t("nameRequired"));
      return;
    }

    startTransition(async () => {
      const res = await updatePotentialClient(client.id, {
        name: name.trim(),
        area: area.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
        facebook: facebook.trim() || null,
        notes: notes.trim() || null,
        opportunities: selectedOpportunities,
      });

      if (!res.success || !res.data) {
        setFormError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      toast.success(t("updatedSuccess"));
      onOpenChange(false);
      onSuccess?.(res.data);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {t("editTitle")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("editSubtitle")} • <span className="font-mono text-primary">{client.business_id}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-300 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Name & Business */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>{t("name")} *</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              disabled={isPending}
            />
          </div>

          {/* Phone & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("phone")}</span>
                {!client.phone && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full font-normal">
                    {t("missingData")}
                  </span>
                )}
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="010XXXXXXXX"
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("area")}</span>
                {!client.area && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full font-normal">
                    {t("missingData")}
                  </span>
                )}
              </label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t("areaPlaceholder")}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t("website")}</span>
              {!client.website && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full font-normal">
                  {t("missingData")}
                </span>
              )}
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. www.clientwebsite.com"
              dir="ltr"
              disabled={isPending}
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("instagram")}</span>
              </label>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                dir="ltr"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("facebook")}</span>
              </label>
              <Input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="facebook.com/page"
                dir="ltr"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Discovered Opportunities */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t("opportunities")}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {OPPORTUNITY_INDICATORS.map((opp) => {
                const isSelected = selectedOpportunities.includes(opp);
                return (
                  <button
                    key={opp}
                    type="button"
                    onClick={() => toggleOpportunity(opp)}
                    disabled={isPending}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-center flex items-center justify-center gap-1 ${
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
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t("notes")}</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              rows={3}
              disabled={isPending}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
              disabled={isPending}
              className="gap-2 bg-primary text-primary-foreground font-medium shadow-xs"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{tCommon("save")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
