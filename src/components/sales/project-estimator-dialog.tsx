"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface ProjectEstimatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeatureModule {
  id: string;
  nameKey:
    | "modWeb"
    | "modMobile"
    | "modAdmin"
    | "modRbac"
    | "modPayment"
    | "modNotif"
    | "modReports"
    | "modAi"
    | "modRealtime"
    | "modErp";
  category: "core" | "platform" | "advanced";
  days: number;
  baseCost: number; // in EGP
}

const AVAILABLE_MODULES: FeatureModule[] = [
  // Platforms
  { id: "web_app", nameKey: "modWeb", category: "platform", days: 12, baseCost: 35000 },
  { id: "mobile_app", nameKey: "modMobile", category: "platform", days: 18, baseCost: 55000 },
  { id: "admin_portal", nameKey: "modAdmin", category: "platform", days: 10, baseCost: 30000 },
  
  // Core Modules
  { id: "auth_rbac", nameKey: "modRbac", category: "core", days: 4, baseCost: 12000 },
  { id: "payment_gw", nameKey: "modPayment", category: "core", days: 5, baseCost: 15000 },
  { id: "notifications", nameKey: "modNotif", category: "core", days: 4, baseCost: 12000 },
  { id: "reports_export", nameKey: "modReports", category: "core", days: 5, baseCost: 14000 },
  
  // Advanced & AI
  { id: "ai_bot", nameKey: "modAi", category: "advanced", days: 8, baseCost: 28000 },
  { id: "realtime_ws", nameKey: "modRealtime", category: "advanced", days: 6, baseCost: 18000 },
  { id: "erp_sync", nameKey: "modErp", category: "advanced", days: 7, baseCost: 22000 },
];

export function ProjectEstimatorDialog({ open, onOpenChange }: ProjectEstimatorDialogProps) {
  const router = useRouter();
  const t = useTranslations("estimator");
  const locale = useLocale();
  const isEn = locale === "en";
  const currencyUnit = isEn ? "EGP" : "ج.م";

  const [projectName, setProjectName] = useState("");
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [marginPercent, setMarginPercent] = useState<number>(35); // 35% margin
  const [maintenanceMonths, setMaintenanceMonths] = useState<number>(3);
  const [copied, setCopied] = useState(false);

  // Effective project name
  const effectiveProjectName = projectName.trim() || t("defaultProjectName");

  const toggleModule = (id: string) => {
    sounds.click();
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const selected = AVAILABLE_MODULES.filter((m) => selectedModuleIds.includes(m.id));
    const totalDays = selected.reduce((acc, curr) => acc + curr.days, 0);
    const baseDevCost = selected.reduce((acc, curr) => acc + curr.baseCost, 0);

    // Maintenance cost (approx 10% of base dev per 3 months)
    const maintenanceCost = Math.round((baseDevCost * 0.035) * maintenanceMonths);

    // Total Cost
    const totalDirectCost = baseDevCost + maintenanceCost;

    // Selling price based on margin: price = cost / (1 - margin)
    const marginDecimal = marginPercent / 100;
    const finalSellingPrice = Math.round(totalDirectCost / (1 - marginDecimal));
    const profitMarginValue = finalSellingPrice - totalDirectCost;

    // Timeline estimate in weeks (assuming parallel tracks for multidisciplinary team)
    const estimatedWeeks = Math.max(2, Math.ceil(totalDays / 5 * 0.75));

    // Three tiers based on scope:
    const mvpPrice = Math.round(finalSellingPrice * 0.7);
    const enterprisePrice = Math.round(finalSellingPrice * 1.45);

    return {
      selectedCount: selected.length,
      totalDays,
      estimatedWeeks,
      totalDirectCost,
      finalSellingPrice,
      profitMarginValue,
      maintenanceCost,
      mvpPrice,
      enterprisePrice,
    };
  }, [selectedModuleIds, marginPercent, maintenanceMonths]);

  const formatMoney = (v: number) => {
    return `${v.toLocaleString(isEn ? "en-US" : "ar-EG")} ${currencyUnit}`;
  };

  const handleCopySummary = () => {
    sounds.copy();
    const text = isEn
      ? `📊 Project Scope & Cost Estimate: ${effectiveProjectName}
━━━━━━━━━━━━━━━━━━━━
⏱️ Estimated Timeline: ${calculation.estimatedWeeks} weeks (${calculation.totalDays} workdays)
🛠️ Selected Modules: ${calculation.selectedCount}
🛡️ Support & Warranty: ${maintenanceMonths} Months

💰 Suggested Pricing Packages:
1. MVP Starter: ${formatMoney(calculation.mvpPrice)}
2. Recommended Scope: ${formatMoney(calculation.finalSellingPrice)}
3. Enterprise Full Package: ${formatMoney(calculation.enterprisePrice)}

✨ Prepared via Nile Nexus Sales Engine.`
      : `📊 تقدير نطاق وتكلفة: ${effectiveProjectName}
━━━━━━━━━━━━━━━━━━━━
⏱️ مدة التنفيذ المقدرة: ${calculation.estimatedWeeks} أسابيع (${calculation.totalDays} يوم عمل)
🛠️ عدد الموديولات المختارة: ${calculation.selectedCount} موديول
🛡️ الدعم الفني والضمان: ${maintenanceMonths} أشهر

💰 خيارات التسعير المقترحة:
1. النسخة المصغرة (MVP): ${formatMoney(calculation.mvpPrice)}
2. النطاق المتكامل (الموصى به): ${formatMoney(calculation.finalSellingPrice)}
3. الباقة المتقدمة الشاملة: ${formatMoney(calculation.enterprisePrice)}

✨ تم إعداد التقدير عبر محرك تسعير Nile Nexus Sales.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateDealWithEstimate = () => {
    sounds.success();
    onOpenChange(false);
    router.push(
      `/deals/new?name=${encodeURIComponent(effectiveProjectName)}&amount=${calculation.finalSellingPrice}`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-start pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold">{t("dialogTitle")}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t("dialogSubtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          {/* Module Selector (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <Label className="text-xs font-semibold">{t("projectNameLabel")}</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("defaultProjectName")}
                className="mt-1 h-9 text-xs sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">
                  {t("modulesHeader")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {t("selectedCount", { count: calculation.selectedCount, total: AVAILABLE_MODULES.length })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pe-1">
                {AVAILABLE_MODULES.map((mod) => {
                  const isSelected = selectedModuleIds.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                          : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-semibold leading-snug line-clamp-2">{t(mod.nameKey)}</span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground">
                        <span>{t("workdays", { days: mod.days })}</span>
                        <span className="font-semibold text-foreground">
                          {formatMoney(mod.baseCost)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
              <div>
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>{t("targetMargin")}</span>
                  <span className="text-primary font-bold">{marginPercent}%</span>
                </Label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value))}
                  className="w-full mt-1.5 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{t("marginCompetitive")}</span>
                  <span>{t("marginStandard")}</span>
                  <span>{t("marginLuxury")}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>{t("warrantyPeriod")}</span>
                  <span className="text-primary font-bold">
                    {maintenanceMonths === 0 ? t("withoutWarranty") : `${maintenanceMonths} ${t("monthsUnit")}`}
                  </span>
                </Label>
                <div className="flex gap-1.5 mt-1.5">
                  {[0, 3, 6, 12].map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={maintenanceMonths === m ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs h-7 px-1 cursor-pointer"
                      onClick={() => setMaintenanceMonths(m)}
                    >
                      {m === 0 ? t("withoutWarranty") : t("monthsCount", { m })}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Tiering (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div>
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t("financialSummary")}
                </span>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold">
                  {t("accuracyBadge")}
                </Badge>
              </div>

              <div className="space-y-2.5 mt-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t("timeline")}
                  </span>
                  <span className="font-bold">
                    {t("timelineWeeksDays", { weeks: calculation.estimatedWeeks, days: calculation.totalDays })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {t("directCost")}
                  </span>
                  <span>{formatMoney(calculation.totalDirectCost)}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    {t("expectedProfit", { margin: marginPercent })}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    +{formatMoney(calculation.profitMarginValue)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center my-2">
                  <span className="text-[11px] text-primary font-medium block">
                    {t("suggestedPrice")}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                    {formatMoney(calculation.finalSellingPrice)}
                  </span>
                </div>

                {/* 3-Tier Proposal Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold block text-muted-foreground">
                    {t("threeTiers")}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">{t("mvp")}</span>
                      <span className="text-xs font-bold text-foreground block">
                        {(calculation.mvpPrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-primary/40 bg-primary/5">
                      <span className="text-[10px] text-primary font-bold block">{t("recommended")}</span>
                      <span className="text-xs font-bold text-primary block">
                        {(calculation.finalSellingPrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">{t("enterprise")}</span>
                      <span className="text-xs font-bold text-foreground block">
                        {(calculation.enterprisePrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 border-t">
              <Button
                type="button"
                className="w-full gap-2 font-semibold h-9 text-xs sm:text-sm cursor-pointer"
                onClick={handleCreateDealWithEstimate}
              >
                <span>{t("createDealAction")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 text-xs h-8 cursor-pointer"
                onClick={handleCopySummary}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? t("copiedSuccess") : t("copySummaryAction")}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
