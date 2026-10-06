import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DealStage } from "@/lib/schemas/deal";

interface DealStageBadgeProps {
  stage: DealStage;
  label?: string;
  className?: string;
}

const stageConfig: Record<
  DealStage,
  {
    bg: string;
    text: string;
    border: string;
    defaultLabelAr: string;
  }
> = {
  NEW: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    defaultLabelAr: "جديدة",
  },
  CONTACTED: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    defaultLabelAr: "اتكلمنا 📞",
  },
  INTERESTED: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    defaultLabelAr: "مهتم 🔥",
  },
  PROPOSAL_SENT: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
    defaultLabelAr: "العرض اتبعت 📑",
  },
  NEGOTIATION: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    defaultLabelAr: "مفاوضات 🤝",
  },
  WON: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    defaultLabelAr: "كسبنا 🎉",
  },
  LOST: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    defaultLabelAr: "خسرنا ❌",
  },
  LATER: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
    defaultLabelAr: "مؤجلة ⏳",
  },
};

import { useTranslations } from "next-intl";

export function DealStageBadge({ stage, label, className }: DealStageBadgeProps) {
  const tDeals = useTranslations("deals");
  const config = stageConfig[stage] || stageConfig.NEW;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium px-2.5 py-0.5 text-xs rounded-full border shadow-2xs whitespace-nowrap",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {label || tDeals(`stages.${stage}`) || config.defaultLabelAr}
    </Badge>
  );
}
