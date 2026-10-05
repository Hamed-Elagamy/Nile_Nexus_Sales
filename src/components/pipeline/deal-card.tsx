"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Trophy, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DealWithRelations } from "@/lib/actions/deals";
import type { DealStage } from "@/lib/schemas/deal";

interface DealCardProps {
  deal: DealWithRelations;
  onAdvanceStage?: (dealId: string, nextStage: DealStage) => void;
  onMarkWon?: (dealId: string) => void;
  onMarkLost?: (dealId: string) => void;
}

const STAGE_ORDER: DealStage[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
];

export function DealCard({
  deal,
  onAdvanceStage,
  onMarkWon,
  onMarkLost,
}: DealCardProps) {
  const currentIndex = STAGE_ORDER.indexOf(deal.stage as DealStage);
  const nextStage = currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIndex + 1]
    : null;

  const formattedValue = deal.estimated_value
    ? `${Number(deal.estimated_value).toLocaleString("ar-EG")} ${deal.currency || "EGP"}`
    : "غير محدد";

  return (
    <Card className="p-3 bg-card border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-sm space-y-2.5 group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-0.5 flex-1 min-w-0">
          <span className="font-mono text-[10px] text-muted-foreground block truncate">
            {deal.business_id}
          </span>
          <Link
            href={`/deals/${deal.id}`}
            className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate"
            title={deal.title}
          >
            {deal.title}
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-xs" className="h-6 w-6 text-muted-foreground">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              render={
                <Link href={`/deals/${deal.id}`} className="cursor-pointer">
                  التفاصيل
                </Link>
              }
            />
            {deal.stage !== "WON" && (
              <DropdownMenuItem
                onClick={() => onMarkWon?.(deal.id)}
                className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>كسبنا الصفقة 🎉</span>
              </DropdownMenuItem>
            )}
            {deal.stage !== "LOST" && (
              <DropdownMenuItem
                onClick={() => onMarkLost?.(deal.id)}
                className="cursor-pointer text-rose-600 dark:text-rose-400"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>خسرنا الصفقة</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Client Name */}
      {deal.client && (
        <div className="text-xs text-muted-foreground truncate">
          <Link
            href={`/clients/${deal.client.id}`}
            className="hover:text-foreground transition-colors"
          >
            🏢 {deal.client.name}
          </Link>
        </div>
      )}

      {/* Value & Stage Transition Button */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
        <span className="font-semibold text-xs text-foreground font-mono">
          {formattedValue}
        </span>

        {nextStage && onAdvanceStage && (
          <Button
            size="xs"
            variant="outline"
            onClick={() => onAdvanceStage(deal.id, nextStage)}
            className="h-6 text-[10px] px-1.5 gap-1 text-primary hover:bg-primary hover:text-primary-foreground"
            title="نقل للمرحلة التالية"
          >
            <span>نقل</span>
            <ChevronLeft className="h-3 w-3 rtl:rotate-0 rotate-180" />
          </Button>
        )}
      </div>
    </Card>
  );
}
