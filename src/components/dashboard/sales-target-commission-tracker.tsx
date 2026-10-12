"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Trophy, Target, TrendingUp, Sparkles, DollarSign, CheckCircle2, ChevronRight, Edit3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SalesTargetCommissionTrackerProps {
  currentWonRevenue: number;
  openPipelineValue?: number;
  wonDealsCount?: number;
  defaultTarget?: number;
  defaultCommissionRate?: number;
  className?: string;
}

export function SalesTargetCommissionTracker({
  currentWonRevenue,
  openPipelineValue = 0,
  wonDealsCount = 0,
  defaultTarget = 250000,
  defaultCommissionRate = 5,
  className,
}: SalesTargetCommissionTrackerProps) {
  const t = useTranslations("dashboard");

  const [monthlyTarget, setMonthlyTarget] = useState<number>(defaultTarget);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(String(defaultTarget));
  const [commissionRate, setCommissionRate] = useState<number>(defaultCommissionRate);

  const percentage = monthlyTarget > 0 ? Math.round((currentWonRevenue / monthlyTarget) * 100) : 0;
  const isTargetAchieved = currentWonRevenue >= monthlyTarget;
  const remaining = Math.max(0, monthlyTarget - currentWonRevenue);

  // Commission calculations
  const earnedCommission = Math.round(currentWonRevenue * (commissionRate / 100));
  const pipelinePotentialCommission = Math.round(openPipelineValue * 0.5 * (commissionRate / 100));
  const totalProjectedCommission = earnedCommission + pipelinePotentialCommission;

  const handleSaveTarget = () => {
    const val = Number(tempTarget);
    if (!isNaN(val) && val > 0) {
      setMonthlyTarget(val);
    }
    setIsEditingTarget(false);
  };

  const presetTargets = [150000, 250000, 500000, 1000000];
  const commissionRates = [3, 5, 7, 10];

  return (
    <Card className={`border-border bg-card shadow-sm overflow-hidden ${className || ""}`}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </span>
            <span>{t("targetTrackerTitle")}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("targetTrackerSubtitle")}
          </p>
        </div>

        {/* Target Edit Control */}
        <div className="flex items-center gap-2">
          {isEditingTarget ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="h-8 w-28 text-xs font-mono"
                autoFocus
              />
              <Button size="xs" onClick={handleSaveTarget} className="h-8 px-2.5 text-xs">
                {t("saveTarget")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                {t("targetGoalLabel")}{" "}
                <span className="font-mono font-bold text-foreground">
                  {monthlyTarget.toLocaleString()} EGP
                </span>
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setTempTarget(String(monthlyTarget));
                  setIsEditingTarget(true);
                }}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title={t("editTarget")}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-6">
        {/* Progress Bar Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span>{t("targetAchievedBadge", { percentage })}</span>
              {isTargetAchieved && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("targetExceeded")}</span>
                </Badge>
              )}
            </span>
            <span className="font-mono text-muted-foreground">
              {currentWonRevenue.toLocaleString()} / {monthlyTarget.toLocaleString()} EGP
            </span>
          </div>

          {/* Graphical Progress Bar */}
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isTargetAchieved
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : percentage >= 50
                  ? "bg-gradient-to-r from-primary to-blue-500"
                  : "bg-gradient-to-r from-amber-500 to-orange-400"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          {/* Quick Target Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-[11px]">{t("monthlyTarget")}:</span>
              {presetTargets.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setMonthlyTarget(pt)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    monthlyTarget === pt
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {(pt / 1000).toLocaleString()}k
                </button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              {isTargetAchieved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{(currentWonRevenue - monthlyTarget).toLocaleString()} EGP فائق التارجت!
                </span>
              ) : (
                <span>
                  {t("remainingToTarget")}:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {remaining.toLocaleString()} EGP
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Commission Simulator Section */}
        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  حاسبة العمولة والتحفيز البيعي 💰
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  اختر نسبة العمولة لحساب أرباحك التقديرية الحالية والمستقبلية
                </p>
              </div>
            </div>

            {/* Commission Rate Selectors */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground font-medium me-1">
                {t("commissionRate")}:
              </span>
              {commissionRates.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setCommissionRate(rate)}
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                    commissionRate === rate
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-card hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium block">
                {t("earnedCommission")}
              </span>
              <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {earnedCommission.toLocaleString()} <span className="text-xs font-sans font-medium text-muted-foreground">EGP</span>
              </p>
              <span className="text-[10px] text-muted-foreground block">
                من {wonDealsCount} صفقات كسبناها فعلياً
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium block">
                {t("pipelinePotentialCommission")}
              </span>
              <p className="text-lg font-black font-mono text-primary">
                {pipelinePotentialCommission.toLocaleString()} <span className="text-xs font-sans font-medium text-muted-foreground">EGP</span>
              </p>
              <span className="text-[10px] text-muted-foreground block">
                من إجمالي {openPipelineValue.toLocaleString()} EGP بايبلاين
              </span>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">
                {t("totalProjectedCommission")}
              </span>
              <p className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300">
                {totalProjectedCommission.toLocaleString()} <span className="text-xs font-sans font-medium text-emerald-600 dark:text-emerald-400">EGP</span>
              </p>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block font-medium">
                صافي العائد المتوقع لهذا الشهر 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 text-xs">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-foreground leading-relaxed font-medium">
            {isTargetAchieved
              ? t("targetMotivationDone", { percentage })
              : t("targetMotivationNear", { remaining: remaining.toLocaleString() })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
