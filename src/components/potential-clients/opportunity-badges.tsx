"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OpportunityIndicator } from "@/types/domain";

interface OpportunityBadgesProps {
  opportunities: OpportunityIndicator[];
  className?: string;
  maxDisplay?: number;
}

export function OpportunityBadges({
  opportunities,
  className,
  maxDisplay = 3,
}: OpportunityBadgesProps) {
  const t = useTranslations("potentialClients.indicators");

  if (!opportunities || opportunities.length === 0) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const displayed = opportunities.slice(0, maxDisplay);
  const remaining = opportunities.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {displayed.map((opp) => (
        <Badge
          key={opp}
          variant="secondary"
          className="text-[11px] px-2 py-0.5 rounded-md font-normal bg-secondary/80 text-secondary-foreground flex items-center gap-1"
        >
          <span>{t(opp)}</span>
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground"
        >
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
