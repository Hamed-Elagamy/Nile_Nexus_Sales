"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DealCard } from "./deal-card";
import { LostDealDialog } from "./lost-deal-dialog";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import {
  updateDealStage,
  type PipelineStageSummary,
} from "@/lib/actions/deals";
import { DEAL_STAGES, type DealStage } from "@/lib/schemas/deal";

interface PipelineBoardProps {
  initialStages: Record<DealStage, PipelineStageSummary>;
  onRefresh?: () => void;
}

export function PipelineBoard({ initialStages, onRefresh }: PipelineBoardProps) {
  const t = useTranslations("pipeline");
  const tDeals = useTranslations("deals");
  const [, startTransition] = useTransition();
  const stages = initialStages;

  // Lost Dialog State
  const [lostDealId, setLostDealId] = useState<string | null>(null);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);

  const handleAdvanceStage = (dealId: string, nextStage: DealStage) => {
    startTransition(async () => {
      const res = await updateDealStage({
        deal_id: dealId,
        stage: nextStage,
      });

      if (res.success) {
        toast.success(t("movedSuccess", { stage: tDeals(`stages.${nextStage}`) }));
        onRefresh?.();
      } else {
        toast.error(res.error || "فشل نقل الصفقة");
      }
    });
  };

  const handleMarkWon = (dealId: string) => {
    startTransition(async () => {
      const res = await updateDealStage({
        deal_id: dealId,
        stage: "WON",
      });

      if (res.success) {
        toast.success(t("wonSuccess"), {
          duration: 5000,
        });
        onRefresh?.();
      } else {
        toast.error(res.error || "فشل تحديث الصفقة");
      }
    });
  };

  const handleMarkLost = (dealId: string) => {
    setLostDealId(dealId);
    setLostDialogOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x select-none">
        {DEAL_STAGES.map((stage) => {
          const summary = stages[stage] || {
            stage,
            deals: [],
            totalValue: 0,
            count: 0,
          };

          const formattedTotal = summary.totalValue > 0
            ? `${summary.totalValue.toLocaleString()} ${t("currency")}`
            : `0 ${t("currency")}`;

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72 sm:w-80 bg-muted/30 rounded-2xl p-3 border border-border/80 flex flex-col max-h-[calc(100vh-14rem)] snap-start"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-border/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <DealStageBadge stage={stage} />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border font-bold text-foreground">
                    {summary.count}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                  <span>{t("totalValue")}</span>
                  <span className="font-semibold text-foreground">{formattedTotal}</span>
                </div>
              </div>

              {/* Deals List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-0.5 scrollbar-thin">
                {summary.deals.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border/80 rounded-xl text-muted-foreground text-xs">
                    {t("emptyStage")}
                  </div>
                ) : (
                  summary.deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onAdvanceStage={handleAdvanceStage}
                      onMarkWon={handleMarkWon}
                      onMarkLost={handleMarkLost}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LostDealDialog
        dealId={lostDealId}
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </>
  );
}
