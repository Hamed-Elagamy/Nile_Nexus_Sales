"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Coffee,
  MapPin,
  Compass,
  Store,
  ExternalLink,
  Flame,
  Calendar,
  Coins,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import {
  createCoffexLeadSchema,
  type CreateCoffexLeadInput,
  COFFEX_ACTIVITY_TYPES,
  COFFEX_BRANCHES_COUNTS,
  COFFEX_CURRENT_SYSTEMS,
  COFFEX_DECISION_MAKER_ROLES,
  COFFEX_INTEREST_LEVELS,
} from "@/lib/schemas/coffex";
import { createCoffexLead } from "@/lib/actions/coffex";
import { detectPhoneCarrier } from "@/lib/utils/phone-carrier";
import { sounds, triggerConfetti } from "@/lib/utils/confetti-sound";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { CoffexLead } from "@/types/coffex";

const DRAFT_STORAGE_KEY = "nile_coffex_onsite_draft";

interface CoffexOnsiteFormProps {
  onSuccess?: (lead: CoffexLead) => void;
}

export function CoffexOnsiteForm({ onSuccess }: CoffexOnsiteFormProps) {
  const t = useTranslations("coffex");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEn = locale === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [successLead, setSuccessLead] = useState<CoffexLead | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCoffexLeadInput>({
    resolver: zodResolver(createCoffexLeadSchema),
    defaultValues: {
      brand_name: "",
      contact_name: "",
      contact_role: "OWNER",
      phone: "",
      alternative_phone: "",
      email: "",
      city: isEn ? "Cairo" : "القاهرة",
      area: "",
      address: "",
      gps_latitude: null,
      gps_longitude: null,
      gps_maps_url: "",
      activity_type: "SPECIALTY_CAFE",
      branches_count: "1",
      current_system: "NONE",
      daily_orders_volume: "100_300",
      interested_modules: [],
      interest_level: "WARM",
      estimated_budget: 25000,
      next_action: t("defaultNextAction"),
      next_action_date: "",
      notes: "",
    },
  });

  // Preserve form state across language switching via sessionStorage draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              setValue(key as any, val);
            }
          });
        }
      }
    } catch {}
  }, [setValue]);

  // Persist entered draft values as the user fills out the form
  useEffect(() => {
    if (typeof window === "undefined") return;
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      } catch {}
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const phoneValue = watch("phone");
  const currentGpsUrl = watch("gps_maps_url");
  const selectedInterest = watch("interest_level");
  const selectedActivity = watch("activity_type");
  const selectedBranches = watch("branches_count");
  const selectedSystem = watch("current_system");
  const selectedRole = watch("contact_role");

  const carrierInfo = detectPhoneCarrier(phoneValue);

  // 1-Click GPS Capture
  const handleCaptureGps = () => {
    sounds.playTactileClick();
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error(t("geoNotSupported"));
      return;
    }

    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const url = `https://www.google.com/maps?q=${lat},${lng}`;

        setValue("gps_latitude", lat);
        setValue("gps_longitude", lng);
        setValue("gps_maps_url", url);

        setIsCapturingGps(false);
        sounds.success();
        toast.success(t("gpsCapturedToast"));
      },
      (err) => {
        setIsCapturingGps(false);
        toast.error(t("gpsError", { error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const onSubmit = async (data: CreateCoffexLeadInput) => {
    try {
      setIsSubmitting(true);
      sounds.playTactileClick();

      const res = await createCoffexLead(data);

      if (!res.success || !res.data) {
        toast.error(res.error || t("saveFailed"));
        return;
      }

      sounds.won();
      triggerConfetti();

      // Clear draft on successful save
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      setSuccessLead(res.data);
      toast.success(t("saveSuccess", { brand: res.data.brand_name }));

      reset();
      if (onSuccess) onSuccess(res.data);
    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    sounds.playTactileClick();
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    reset();
  };

  // Build Personalized Instant WhatsApp Message using localized translations
  const buildWhatsAppUrl = (lead: CoffexLead) => {
    let cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
      cleanPhone = "2" + cleanPhone;
    }

    const message = t("whatsAppIntroMessage", {
      contact: lead.contact_name,
      brand: lead.brand_name,
    });

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Onsite Header Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
              <Coffee className="h-6 w-6 stroke-[2.2px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {t("formTitle")}
                </h2>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 text-[11px] font-semibold"
                >
                  {t("onsiteBadge")}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("formSubtitle")}
              </p>
            </div>
          </div>

          {/* Quick GPS Capture in Header */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCaptureGps}
            disabled={isCapturingGps}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 shrink-0 h-10 px-4 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Compass
              className={`h-4 w-4 ${isCapturingGps ? "animate-spin text-primary" : ""}`}
            />
            <span>
              {isCapturingGps
                ? t("capturingGps")
                : currentGpsUrl
                ? t("gpsCaptured")
                : t("captureGps")}
            </span>
          </Button>
        </div>

        {currentGpsUrl && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/60">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate flex-1 font-mono text-[11px]">{currentGpsUrl}</span>
            <a
              href={currentGpsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 font-semibold shrink-0"
            >
              <span>{t("openInMaps")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Brand & Contact Info */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Store className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionBrandInfo")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Brand / Cafe Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{t("brandName")}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("brand_name")}
                placeholder={t("brandNamePlaceholder")}
                className="h-10 text-xs"
              />
              {errors.brand_name && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{t("validation.brandNameRequired")}</span>
                </p>
              )}
            </div>

            {/* Contact Person Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{t("contactName")}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("contact_name")}
                placeholder={t("contactNamePlaceholder")}
                className="h-10 text-xs"
              />
              {errors.contact_name && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{t("validation.contactNameRequired")}</span>
                </p>
              )}
            </div>

            {/* Contact Role / Decision Maker Position */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("contactRole")}
              </label>
              <select
                {...register("contact_role")}
                value={selectedRole}
                onChange={(e) => setValue("contact_role", e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                {COFFEX_DECISION_MAKER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number with Carrier Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>{t("phone")}</span>
                  <span className="text-destructive">*</span>
                </label>
                {carrierInfo && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${carrierInfo.badgeColor}`}
                  >
                    {isEn ? carrierInfo.name_en : carrierInfo.name_ar}
                  </span>
                )}
              </div>
              <Input
                {...register("phone")}
                dir="ltr"
                placeholder="010XXXXXXXX"
                className="h-10 text-xs font-mono"
              />
              {errors.phone && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{t("validation.phoneRequired")}</span>
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("city")}
              </label>
              <Input
                {...register("city")}
                placeholder={t("cityPlaceholder")}
                className="h-10 text-xs"
              />
            </div>

            {/* Area / District */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{t("area")}</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("area")}
                placeholder={t("areaPlaceholder")}
                className="h-10 text-xs"
              />
              {errors.area && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{t("validation.areaRequired")}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Coffee Activity & Operational Profile */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Coffee className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionActivityProfile")}
            </h3>
          </div>

          {/* Activity Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("activityType")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COFFEX_ACTIVITY_TYPES.map((type) => {
                const isSelected = selectedActivity === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      sounds.playTactileClick();
                      setValue("activity_type", type);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-start flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span className="truncate">{t(`activities.${type}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Branches Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                {t("branchesCount")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COFFEX_BRANCHES_COUNTS.map((cnt) => {
                  const isSelected = selectedBranches === cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        sounds.playTactileClick();
                        setValue("branches_count", cnt);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {cnt === "1" ? t("singleBranch") : cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current System */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                {t("currentSystem")}
              </label>
              <select
                {...register("current_system")}
                value={selectedSystem}
                onChange={(e) => setValue("current_system", e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                {COFFEX_CURRENT_SYSTEMS.map((sys) => (
                  <option key={sys} value={sys}>
                    {t(`systems.${sys}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Budget */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  {t("estimatedBudget")}
                </label>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t("currency")}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  {...register("estimated_budget")}
                  className="h-10 text-xs ps-8"
                  placeholder="25000"
                />
                <Coins className="h-4 w-4 text-muted-foreground absolute start-2.5 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Urgency, Next Follow-up & Notes */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Flame className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionFollowUp")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Urgency / Interest Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                {t("interestLevel")}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {COFFEX_INTEREST_LEVELS.map((lvl) => {
                  const isSelected = selectedInterest === lvl;
                  const color =
                    lvl === "HOT"
                      ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                      : lvl === "WARM"
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400";

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        sounds.playTactileClick();
                        setValue("interest_level", lvl);
                      }}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all text-center cursor-pointer ${
                        isSelected
                          ? `${color} ring-1 font-bold shadow-xs`
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {t(`interest.${lvl}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Action Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("nextAction")}
              </label>
              <Input
                {...register("next_action")}
                placeholder={t("nextActionPlaceholder")}
                className="h-10 text-xs"
              />
            </div>

            {/* Next Scheduled Follow-up Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("nextActionDate")}</span>
              </label>
              <Input
                type="date"
                {...register("next_action_date")}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Onsite Meeting Notes */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-foreground">
              {t("notes")}
            </label>
            <Textarea
              {...register("notes")}
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="text-xs"
            />
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isSubmitting}
            className="text-xs"
          >
            {t("resetForm")}
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all gap-2 cursor-pointer"
          >
            <Coffee className="h-4 w-4" />
            <span>{isSubmitting ? t("submitting") : t("submitLead")}</span>
          </Button>
        </div>
      </form>

      {/* Post-Submission Celebration & WhatsApp Launcher Dialog */}
      {successLead && (
        <Dialog open={!!successLead} onOpenChange={() => setSuccessLead(null)}>
          <DialogContent className="sm:max-w-md text-start">
            <DialogHeader>
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold">
                {t("successDialogTitle")}
              </DialogTitle>
              <DialogDescription className="text-center text-xs">
                {t("successDialogDesc", { brand: successLead.brand_name })}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("leadCode")}:</span>
                <span className="font-bold text-foreground">{successLead.business_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("contactName")}:</span>
                <span className="font-semibold text-foreground">
                  {successLead.contact_name} ({t(`roles.${successLead.contact_role}`)})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("phone")}:</span>
                <span className="font-mono text-foreground" dir="ltr">
                  {successLead.phone}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t("area")}:</span>
                <span className="text-foreground">
                  {successLead.city} - {successLead.area}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {/* 1-Click WhatsApp Launcher */}
              <a
                href={buildWhatsAppUrl(successLead)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playTactileClick()}
                className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t("sendWhatsAppNow")}</span>
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSuccessLead(null)}
                className="w-full text-xs h-10"
              >
                {t("closeDialog")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
