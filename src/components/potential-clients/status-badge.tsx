import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PotentialClientStatusType } from "@/lib/schemas/potential-client";

interface StatusBadgeProps {
  status: PotentialClientStatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  PotentialClientStatusType,
  {
    bg: string;
    text: string;
    border: string;
    defaultLabelAr: string;
    defaultLabelEn: string;
  }
> = {
  NEW: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    defaultLabelAr: "لسه",
    defaultLabelEn: "New",
  },
  RESEARCHING: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    defaultLabelAr: "شغال عليه 🔍",
    defaultLabelEn: "Researching 🔍",
  },
  RESEARCHED: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    defaultLabelAr: "البحث خلص 🔥",
    defaultLabelEn: "Researched 🔥",
  },
  CONVERTED: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    defaultLabelAr: "اتحوّل 🚀",
    defaultLabelEn: "Converted 🚀",
  },
  ARCHIVED: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
    defaultLabelAr: "مؤرشف",
    defaultLabelEn: "Archived",
  },
};

export function PotentialClientStatusBadge({
  status,
  label,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NEW;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium px-2.5 py-0.5 text-xs rounded-full border shadow-xs transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {label || config.defaultLabelAr}
    </Badge>
  );
}
