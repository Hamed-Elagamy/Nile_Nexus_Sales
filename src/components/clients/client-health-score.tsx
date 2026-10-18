"use client";

import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Flame, HeartPulse, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type HealthLevel = "champion" | "healthy" | "at_risk" | "dormant";

export interface HealthEvaluation {
  score: number;
  level: HealthLevel;
  label_ar: string;
  label_en: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  advice_ar: string;
}

export function evaluateClientHealth(params: {
  wonDealsCount?: number;
  activeDealsCount?: number;
  daysSinceLastContact?: number;
  hasOverdueTasks?: boolean;
}): HealthEvaluation {
  let score = 50; // base

  const wonDeals = params.wonDealsCount ?? 0;
  const activeDeals = params.activeDealsCount ?? 0;
  const daysSince = params.daysSinceLastContact ?? 10;
  const hasOverdue = params.hasOverdueTasks ?? false;

  // Add points for won deals
  score += Math.min(wonDeals * 20, 40);

  // Add points for active pipeline
  if (activeDeals > 0) score += 15;

  // Recency of contact
  if (daysSince <= 5) score += 20;
  else if (daysSince <= 12) score += 10;
  else if (daysSince > 25) score -= 25;
  else if (daysSince > 45) score -= 40;

  // Penalize for overdue tasks
  if (hasOverdue) score -= 15;

  // Clamp 0 - 100
  score = Math.max(10, Math.min(100, score));

  if (score >= 85) {
    return {
      score,
      level: "champion",
      label_ar: "علاقة ذهبية",
      label_en: "Champion Client",
      colorClass: "text-emerald-700 dark:text-emerald-300",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      advice_ar: "عميل استراتيجي ممتاز! فرصة لعرض باقات إضافية (Upsell) أو طلب تزكية (Referral).",
    };
  }

  if (score >= 65) {
    return {
      score,
      level: "healthy",
      label_ar: "نشط ومستقر",
      label_en: "Healthy",
      colorClass: "text-teal-700 dark:text-teal-300",
      bgClass: "bg-teal-500/10",
      borderClass: "border-teal-500/30",
      advice_ar: "العلاقة ممتازة ومعدل المتابعة طبيعي. استمر في مشاركة التحديثات الدورية.",
    };
  }

  if (score >= 40) {
    return {
      score,
      level: "at_risk",
      label_ar: "معرّض للخطر",
      label_en: "At Risk",
      colorClass: "text-amber-700 dark:text-amber-300",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/30",
      advice_ar: "تأخرت المتابعة أو توقفت الصفقات! يفضل إجراء مكالمة سريعة لتجديد الاهتمام.",
    };
  }

  return {
    score,
    level: "dormant",
    label_ar: "خامل / راكد",
    label_en: "Dormant",
    colorClass: "text-rose-700 dark:text-rose-300",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    advice_ar: "انقطاع طويل في التواصل. أرسل رسالة إعادة إحياء (Revival Sequence) أو عرض ترويجي.",
  };
}

interface ClientHealthBadgeProps {
  score?: number;
  wonDealsCount?: number;
  activeDealsCount?: number;
  daysSinceLastContact?: number;
  hasOverdueTasks?: boolean;
  compact?: boolean;
}

export function ClientHealthBadge({
  score: manualScore,
  wonDealsCount = 0,
  activeDealsCount = 0,
  daysSinceLastContact = 8,
  hasOverdueTasks = false,
  compact = false,
}: ClientHealthBadgeProps) {
  const evalResult = evaluateClientHealth({
    wonDealsCount,
    activeDealsCount,
    daysSinceLastContact,
    hasOverdueTasks,
  });

  const finalScore = manualScore ?? evalResult.score;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold transition-all select-none",
        evalResult.bgClass,
        evalResult.borderClass,
        evalResult.colorClass
      )}
      title={`${evalResult.label_ar}: ${evalResult.advice_ar}`}
    >
      <span className="relative flex h-2 w-2">
        {evalResult.level === "champion" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            evalResult.level === "champion" && "bg-emerald-500",
            evalResult.level === "healthy" && "bg-teal-500",
            evalResult.level === "at_risk" && "bg-amber-500",
            evalResult.level === "dormant" && "bg-rose-500"
          )}
        />
      </span>

      <span>{evalResult.label_ar}</span>
      {!compact && (
        <span className="font-mono text-[10px] opacity-80">
          ({finalScore}%)
        </span>
      )}
    </div>
  );
}
