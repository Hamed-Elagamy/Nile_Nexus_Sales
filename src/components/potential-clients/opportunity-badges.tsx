import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OpportunityIndicator } from "@/types/domain";

interface OpportunityBadgesProps {
  opportunities: OpportunityIndicator[];
  className?: string;
  maxDisplay?: number;
}

const indicatorLabels: Record<OpportunityIndicator, { labelAr: string; icon: string }> = {
  WEBSITE: { labelAr: "موقع", icon: "🌐" },
  ECOMMERCE: { labelAr: "متجر", icon: "🛒" },
  SOCIAL_MEDIA: { labelAr: "سوشيال", icon: "📱" },
  BRANDING: { labelAr: "هوية", icon: "🎨" },
  ERP_SYSTEM: { labelAr: "ERP", icon: "⚙️" },
  MARKETING: { labelAr: "تسويق", icon: "📢" },
  MOBILE_APP: { labelAr: "تطبيق", icon: "📲" },
  OTHER: { labelAr: "أخرى", icon: "💡" },
};

export function OpportunityBadges({
  opportunities,
  className,
  maxDisplay = 3,
}: OpportunityBadgesProps) {
  if (!opportunities || opportunities.length === 0) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const displayed = opportunities.slice(0, maxDisplay);
  const remaining = opportunities.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {displayed.map((opp) => {
        const item = indicatorLabels[opp] || { labelAr: opp, icon: "✨" };
        return (
          <Badge
            key={opp}
            variant="secondary"
            className="text-[11px] px-2 py-0.5 rounded-md font-normal bg-secondary/80 text-secondary-foreground flex items-center gap-1"
          >
            <span>{item.icon}</span>
            <span>{item.labelAr}</span>
          </Badge>
        );
      })}
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
