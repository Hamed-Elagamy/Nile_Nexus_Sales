"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Snowflake, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type DealTemperature = "HOT" | "WARM" | "STALLED" | "ARCHIVED";

export interface DealHeatInfo {
  temperature: DealTemperature;
  days: number;
  label_ar: string;
  label_en: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export function calculateDealHeat(dateString?: string | null, isClosed = false): DealHeatInfo {
  if (isClosed) {
    return {
      temperature: "ARCHIVED",
      days: 0,
      label_ar: "مكتملة",
      label_en: "Closed",
      badgeClass: "bg-muted text-muted-foreground border-border/40",
      icon: null,
    };
  }

  if (!dateString) {
    return {
      temperature: "WARM",
      days: 0,
      label_ar: "جديدة",
      label_en: "New",
      badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200",
      icon: <Zap className="h-3 w-3" />,
    };
  }

  const updatedTime = new Date(dateString).getTime();
  const diffDays = Math.max(0, Math.floor((Date.now() - updatedTime) / (1000 * 60 * 60 * 24)));

  if (diffDays <= 3) {
    return {
      temperature: "HOT",
      days: diffDays,
      label_ar: "ساخنة 🔥",
      label_en: "Hot",
      badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 animate-pulse",
      icon: <Flame className="h-3 w-3 text-rose-500 fill-rose-500" />,
    };
  }

  if (diffDays <= 7) {
    return {
      temperature: "WARM",
      days: diffDays,
      label_ar: `نشطة (${diffDays}ي)`,
      label_en: `Active (${diffDays}d)`,
      badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200",
      icon: <Zap className="h-3 w-3 text-amber-500" />,
    };
  }

  return {
    temperature: "STALLED",
    days: diffDays,
    label_ar: `راكدة (${diffDays} يوم) ❄️`,
    label_en: `Stalled (${diffDays}d)`,
    badgeClass: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 ring-1 ring-cyan-400/30",
    icon: <Snowflake className="h-3 w-3 text-cyan-600 animate-spin" style={{ animationDuration: "8s" }} />,
  };
}

interface DealHeatBadgeProps {
  updatedAt?: string | null;
  isClosed?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function DealHeatBadge({
  updatedAt,
  isClosed = false,
  className,
  showIcon = true,
}: DealHeatBadgeProps) {
  const heat = calculateDealHeat(updatedAt, isClosed);

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0 h-4 font-medium flex items-center gap-1 transition-all",
        heat.badgeClass,
        className
      )}
      title={`آخر نشاط قبل ${heat.days} يوم`}
    >
      {showIcon && heat.icon}
      <span>{heat.label_ar}</span>
    </Badge>
  );
}
