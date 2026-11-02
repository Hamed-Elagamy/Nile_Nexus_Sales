"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  ShoppingBag,
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
  Globe,
  Layers,
} from "lucide-react";
import {
  createNexaLeadSchema,
  type CreateNexaLeadInput,
  NEXA_VERTICAL_TYPES,
  NEXA_COMMERCE_MODELS,
  NEXA_CURRENT_SYSTEMS,
  NEXA_BRANCHES_COUNTS,
  NEXA_ORDER_VOLUMES,
  NEXA_PLAN_INTERESTS,
  NEXA_DECISION_MAKER_ROLES,
  NEXA_INTEREST_LEVELS,
} from "@/lib/schemas/nexa";
import { createNexaLead } from "@/lib/actions/nexa";
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
import type { NexaLead } from "@/types/nexa";

const DRAFT_STORAGE_KEY = "tammlo_nexa_onsite_draft";

interface NexaOnsiteFormProps {
  onSuccess?: (lead: NexaLead) => void;
}

export function NexaOnsiteForm({ onSuccess }: NexaOnsiteFormProps) {
  const t = useTranslations("nexa");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEn = locale === "en";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [successLead, setSuccessLead] = useState<NexaLead | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateNexaLeadInput>({
    resolver: zodResolver(createNexaLeadSchema),
    defaultValues: {
      brand_name: "",
      contact_name: "",
      contact_role: "OWNER",
      phone: "",
      alternative_phone: "",
      email: "",
      store_url: "",
      city: isEn ? "Cairo" : "القاهرة",
      area: "",
      address: "",
      gps_latitude: null,
      gps_longitude: null,
      gps_maps_url: "",
      vertical_type: "FASHION_APPAREL",
      commerce_model: "OMNICHANNEL",
      current_system: "NONE_EXCEL",
      monthly_order_volume: "100_500",
      branches_count: "1",
      plan_interest: "GROWTH",
      interest_level: "WARM",
      estimated_budget: 35000,
      next_action: t("defaultNextAction"),
      next_action_date: "",
      notes: "",
    },
  });

  // Preserve form state across language switching via sessionStorage draft
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(key as any, val);
          }
        });
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [setValue]);

  // Sync draft to sessionStorage on change
  const watchedValues = watch();
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(watchedValues));
    } catch {
      // Ignore
    }
  }, [watchedValues]);

  // Phone carrier detection
  const phoneValue = watch("phone");
  const carrier = detectPhoneCarrier(phoneValue || "");

  // GPS coordinates capture
  const gpsLat = watch("gps_latitude");
  const gpsLng = watch("gps_longitude");
  const gpsUrl = watch("gps_maps_url");

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
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
        sounds.playTactileClick();
        toast.success(t("gpsCapturedToast"));
      },
      (err) => {
        setIsCapturingGps(false);
        toast.error(t("gpsError", { error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const onSubmit = async (values: CreateNexaLeadInput) => {
    setIsSubmitting(true);
    try {
      const res = await createNexaLead(values);
      setIsSubmitting(false);

      if (!res.success || !res.data) {
        toast.error(res.error || t("saveFailed"));
        return;
      }

      // Celebratory Audio & Visual Effects
      triggerConfetti();
      sounds.playWonChime();

      setSuccessLead(res.data);
      toast.success(t("saveSuccess", { brand: res.data.brand_name }));

      // Clear draft
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      reset({
        brand_name: "",
        contact_name: "",
        contact_role: "OWNER",
        phone: "",
        alternative_phone: "",
        email: "",
        store_url: "",
        city: isEn ? "Cairo" : "القاهرة",
        area: "",
        address: "",
        gps_latitude: null,
        gps_longitude: null,
        gps_maps_url: "",
        vertical_type: "FASHION_APPAREL",
        commerce_model: "OMNICHANNEL",
        current_system: "NONE_EXCEL",
        monthly_order_volume: "100_500",
        branches_count: "1",
        plan_interest: "GROWTH",
        interest_level: "WARM",
        estimated_budget: 35000,
        next_action: t("defaultNextAction"),
        next_action_date: "",
        notes: "",
      });

      if (onSuccess) onSuccess(res.data);
    } catch {
      setIsSubmitting(false);
      toast.error(t("unexpectedError"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Onsite Capture Header */}
      <div className="bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {t("formTitle")}
                </h2>
                <Badge
                  variant="outline"
                  className="bg-primary/15 text-primary border-primary/30 text-[10px] font-semibold"
                >
                  <Sparkles className="h-3 w-3 me-1 inline" />
                  {t("onsiteBadge")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("formSubtitle")}
              </p>
            </div>
          </div>

          {/* 1-Click GPS Trigger */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              type="button"
              variant={gpsLat ? "outline" : "default"}
              size="sm"
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              className="gap-2 text-xs h-9 cursor-pointer shadow-xs"
            >
              <Compass className={`h-4 w-4 ${isCapturingGps ? "animate-spin" : ""}`} />
              <span>
                {isCapturingGps
                  ? t("capturingGps")
                  : gpsLat
                  ? t("gpsCaptured")
                  : t("captureGps")}
              </span>
            </Button>
            {gpsUrl && (
              <a
                href={gpsUrl}
                target="_blank"
                rel="noreferrer"
                title={t("openInMaps")}
                className="inline-flex items-center justify-center h-9 px-2.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Brand & Decision Maker Info */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Store className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionBrandInfo")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Brand / Store Name */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("brandName")} *</span>
                {errors.brand_name && (
                  <span className="text-[10px] text-destructive flex items-center gap-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {errors.brand_name.message}
                  </span>
                )}
              </label>
              <Input
                {...register("brand_name")}
                placeholder={t("brandNamePlaceholder")}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Contact Person Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("contactName")} *</span>
                {errors.contact_name && (
                  <span className="text-[10px] text-destructive flex items-center gap-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {errors.contact_name.message}
                  </span>
                )}
              </label>
              <Input
                {...register("contact_name")}
                placeholder={t("contactNamePlaceholder")}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Decision Maker Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("contactRole")}
              </label>
              <select
                {...register("contact_role")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_DECISION_MAKER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone & Live Egyptian Carrier Detection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("phone")} *</span>
                {carrier && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 border ${carrier.badgeColor}`}
                  >
                    {carrier.name_ar}
                  </Badge>
                )}
              </label>
              <Input
                {...register("phone")}
                placeholder="010..., 011..., 012..."
                dir="ltr"
                className="h-10 text-xs sm:text-sm font-mono"
              />
              {errors.phone && (
                <p className="text-[10px] text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Store URL or Social Page */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("storeUrl")}</span>
              </label>
              <Input
                {...register("store_url")}
                placeholder={t("storeUrlPlaceholder")}
                dir="ltr"
                className="h-10 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("city")}
              </label>
              <Input
                {...register("city")}
                placeholder={t("cityPlaceholder")}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Area / District */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("area")} *</span>
                {errors.area && (
                  <span className="text-[10px] text-destructive">
                    {errors.area.message}
                  </span>
                )}
              </label>
              <Input
                {...register("area")}
                placeholder={t("areaPlaceholder")}
                className="h-10 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Store Commerce Model & Profile */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionActivityProfile")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Store Vertical */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("verticalType")}
              </label>
              <select
                {...register("vertical_type")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_VERTICAL_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {t(`verticals.${v}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Commerce Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("commerceModel")}
              </label>
              <select
                {...register("commerce_model")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_COMMERCE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {t(`commerceModels.${m}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Current System */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("currentSystem")}
              </label>
              <select
                {...register("current_system")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_CURRENT_SYSTEMS.map((s) => (
                  <option key={s} value={s}>
                    {t(`systems.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Branches / Warehouses count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("branchesCount")}
              </label>
              <select
                {...register("branches_count")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_BRANCHES_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt === "1" ? t("singleBranch") : `${cnt} ${t("branchesCount")}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Order Volume */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("monthlyOrderVolume")}
              </label>
              <select
                {...register("monthly_order_volume")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_ORDER_VOLUMES.map((vol) => (
                  <option key={vol} value={vol}>
                    {t(`orderVolumes.${vol}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Nexa Subscription Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("planInterest")}
              </label>
              <select
                {...register("plan_interest")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-semibold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_PLAN_INTERESTS.map((plan) => (
                  <option key={plan} value={plan}>
                    {t(`plans.${plan}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Readiness, Budget & Demo Follow-up */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Flame className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">
              {t("sectionFollowUp")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Interest Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("interestLevel")}
              </label>
              <select
                {...register("interest_level")}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {NEXA_INTEREST_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {t(`interest.${lvl}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Budget */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("estimatedBudget")} ({t("currency")})
              </label>
              <Input
                type="number"
                {...register("estimated_budget")}
                className="h-10 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Next Action Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("nextActionDate")}</span>
              </label>
              <Input
                type="datetime-local"
                {...register("next_action_date")}
                className="h-10 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Next Action Description */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-foreground">
                {t("nextAction")}
              </label>
              <Input
                {...register("next_action")}
                placeholder={t("nextActionPlaceholder")}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Field Notes */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-foreground">
                {t("notes")}
              </label>
              <Textarea
                {...register("notes")}
                placeholder={t("notesPlaceholder")}
                rows={3}
                className="text-xs sm:text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isSubmitting ? t("submitting") : t("submitLead")}</span>
          </Button>
        </div>
      </form>

      {/* Success Modal with 1-Click WhatsApp Welcome Link */}
      <Dialog open={!!successLead} onOpenChange={() => setSuccessLead(null)}>
        <DialogContent className="sm:max-w-md p-6 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t("successDialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {successLead && t("successDialogDesc", { brand: successLead.brand_name })}
            </DialogDescription>
          </DialogHeader>

          {successLead && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5 text-start font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("leadCode")}:</span>
                <span className="font-bold text-primary">{successLead.business_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("phone")}:</span>
                <span>{successLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("verticalType")}:</span>
                <span>{t(`verticals.${successLead.vertical_type}`)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {successLead && (
              <Button
                type="button"
                onClick={() => {
                  let p = successLead.phone.replace(/[^0-9]/g, "");
                  if (p.startsWith("01") && p.length === 11) p = "2" + p;
                  const text = t("whatsAppIntroMessage", {
                    contact: successLead.contact_name,
                    brand: successLead.brand_name,
                  });
                  window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t("sendWhatsAppNow")}</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setSuccessLead(null)}
              className="w-full text-xs"
            >
              {t("closeDialog")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
