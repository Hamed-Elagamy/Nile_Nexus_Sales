"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  Coins,
  Award,
  Zap,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useTranslations, useLocale } from "next-intl";

interface SalesRepPerformance {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  quota: number;
  won: number;
  avatar_ar: string;
  avatar_en: string;
}

const INITIAL_REPS: SalesRepPerformance[] = [
  { id: "1", name_ar: "كريم فهمي", name_en: "Karim Fahmy", role_ar: "مسؤول مبيعات أول", role_en: "Senior Sales Exec", quota: 450000, won: 495000, avatar_ar: "ك.ف", avatar_en: "KF" },
  { id: "2", name_ar: "مصطفى كمال", name_en: "Mostafa Kamal", role_ar: "مسؤول حسابات", role_en: "Account Executive", quota: 400000, won: 340000, avatar_ar: "م.ك", avatar_en: "MK" },
  { id: "3", name_ar: "أحمد الشناوي", name_en: "Ahmed El-Shennawy", role_ar: "مدير مبيعات", role_en: "Sales Director", quota: 650000, won: 710000, avatar_ar: "أ.ش", avatar_en: "AS" },
];

export function CommissionQuotaSimulator() {
  const t = useTranslations("targets");
  const locale = useLocale();
  const isEn = locale === "en";
  const currencyUnit = isEn ? "EGP" : "ج.م";

  const [selectedRepId, setSelectedRepId] = useState<string>("1");
  const [quota, setQuota] = useState<number>(450000);
  const [wonAmount, setWonAmount] = useState<number>(495000);

  // Month progress
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);

  const handleSelectRep = (rep: SalesRepPerformance) => {
    sounds.click();
    setSelectedRepId(rep.id);
    setQuota(rep.quota);
    setWonAmount(rep.won);
  };

  const calculation = useMemo(() => {
    const rate = quota > 0 ? (wonAmount / quota) * 100 : 0;
    const gap = Math.max(0, quota - wonAmount);
    const dailyRunRate = Math.round(gap / remainingDays);

    // Commission Tiers:
    // Base tier: 3.5%
    // Standard: 5% if reached 100%
    // Accelerator: 7% on anything above 100%
    let baseCommission = 0;
    let acceleratorCommission = 0;

    if (wonAmount <= quota) {
      const percentage = wonAmount / quota;
      const commissionRate = percentage >= 1 ? 0.05 : 0.035;
      baseCommission = Math.round(wonAmount * commissionRate);
    } else {
      baseCommission = Math.round(quota * 0.05); // 5% on target
      const surplus = wonAmount - quota;
      acceleratorCommission = Math.round(surplus * 0.07); // 7% accelerator
    }

    const totalCommission = baseCommission + acceleratorCommission;

    // Gamification Rank
    let rank = {
      title: t("rankBronze"),
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300",
      icon: <Award className="h-4 w-4 text-amber-600" />,
    };

    if (rate >= 120) {
      rank = {
        title: t("rankDiamond"),
        badgeClass: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200",
        icon: <Trophy className="h-4 w-4 text-cyan-600" />,
      };
    } else if (rate >= 100) {
      rank = {
        title: t("rankGold"),
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
        icon: <Trophy className="h-4 w-4 text-emerald-600" />,
      };
    } else if (rate >= 75) {
      rank = {
        title: t("rankSilver"),
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200",
        icon: <Award className="h-4 w-4 text-slate-500" />,
      };
    }

    return {
      rate: Math.round(rate),
      gap,
      dailyRunRate,
      baseCommission,
      acceleratorCommission,
      totalCommission,
      rank,
      isTargetAchieved: wonAmount >= quota,
    };
  }, [quota, wonAmount, remainingDays, t]);

  const formatMoney = (v: number) => {
    return `${v.toLocaleString(isEn ? "en-US" : "ar-EG")} ${currencyUnit}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Gamification Rank */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs gap-1 py-0.5 px-2.5 font-bold ${calculation.rank.badgeClass}`}>
              {calculation.rank.icon}
              <span>{calculation.rank.title}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t("remainingDays", { days: remainingDays })}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("bannerTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("bannerSubtitle")}
          </p>
        </div>

        <div className="text-end bg-card p-3 rounded-xl border border-border/80 shadow-xs">
          <span className="text-[11px] text-muted-foreground block">{t("expectedCommissions")}</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            +{calculation.totalCommission.toLocaleString(isEn ? "en-US" : "ar-EG")}
            <span className="text-xs font-normal ms-1">{currencyUnit}</span>
          </span>
        </div>
      </div>

      {/* Rep Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 me-1">{t("selectRep")}</span>
        {INITIAL_REPS.map((rep) => {
          const isSelected = rep.id === selectedRepId;
          const repRate = Math.round((rep.won / rep.quota) * 100);
          return (
            <button
              key={rep.id}
              type="button"
              onClick={() => handleSelectRep(rep)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                {isEn ? rep.avatar_en : rep.avatar_ar}
              </div>
              <div className="text-start">
                <span className="font-bold block text-foreground">{isEn ? rep.name_en : rep.name_ar}</span>
                <span className="text-[10px] opacity-75">{repRate}% {t("achievement")}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Target Quota */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("monthlyQuota")}</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black tracking-tight text-foreground font-mono">
            <AnimatedCounter value={quota} formatter={formatMoney} />
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {t("quotaFromMgmt")}
          </span>
        </Card>

        {/* Won Amount */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("wonSales")}</span>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            <AnimatedCounter value={wonAmount} formatter={formatMoney} />
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
            {calculation.rate}% {t("ofTarget")}
          </span>
        </Card>

        {/* Remaining Gap */}
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("remainingGap")}</span>
            <Coins className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-foreground font-mono">
            {calculation.isTargetAchieved ? (
              <span className="text-emerald-600">{t("targetSurpassed")}</span>
            ) : (
              <AnimatedCounter value={calculation.gap} formatter={formatMoney} />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {t("dailyRequired", { amount: `${calculation.dailyRunRate.toLocaleString(isEn ? "en-US" : "ar-EG")} ${currencyUnit}` })}
          </span>
        </Card>

        {/* Commission Payout */}
        <Card className="p-4 space-y-1 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs">
            <span>{t("dueCommission")}</span>
            <Zap className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            <AnimatedCounter value={calculation.totalCommission} formatter={(v) => `+${formatMoney(v)}`} />
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {calculation.acceleratorCommission > 0 ? t("acceleratorIncluded") : t("standardTier")}
          </span>
        </Card>
      </div>

      {/* Progress Bar & Sliders */}
      <Card className="p-5 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>{t("progressTitle")}</span>
            <span className="text-primary font-bold text-sm">{calculation.rate}%</span>
          </div>

          <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculation.isTargetAchieved
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(100, calculation.rate)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0 {currencyUnit}</span>
            <span>{t("breakEven")}: {quota.toLocaleString(isEn ? "en-US" : "ar-EG")} {currencyUnit}</span>
            <span className="text-emerald-600 font-bold">{t("acceleratorBonus")}</span>
          </div>
        </div>

        {/* Interactive Sliders for Sales Simulations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t">
          <div>
            <label className="text-xs font-semibold flex items-center justify-between">
              <span>{t("wonSlider")}</span>
              <span className="font-bold text-primary">{formatMoney(wonAmount)}</span>
            </label>
            <input
              type="range"
              min="50000"
              max={quota * 1.6}
              step="10000"
              value={wonAmount}
              onChange={(e) => setWonAmount(Number(e.target.value))}
              className="w-full mt-2 accent-primary cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold flex items-center justify-between">
              <span>{t("targetSlider")}</span>
              <span className="font-bold text-foreground">{formatMoney(quota)}</span>
            </label>
            <input
              type="range"
              min="100000"
              max="1500000"
              step="25000"
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="w-full mt-2 accent-muted-foreground cursor-pointer"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
