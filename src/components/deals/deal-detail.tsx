"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Clock,
  Coins,
  Plus,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DealStageBadge } from "./deal-stage-badge";
import { LostDealDialog } from "@/components/pipeline/lost-deal-dialog";
import { updateDealStage, type DealWithRelations } from "@/lib/actions/deals";
import { DEAL_STAGES, type DealStage } from "@/lib/schemas/deal";
import type { Activity } from "@/types/domain";

interface DealDetailProps {
  deal: DealWithRelations & { activities?: Activity[] };
}

export function DealDetail({ deal }: DealDetailProps) {
  const tDeals = useTranslations("deals");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [currentStage, setCurrentStage] = useState<DealStage>(deal.stage as DealStage);
  const [, startTransition] = useTransition();

  const [lostDialogOpen, setLostDialogOpen] = useState(false);

  const handleStageClick = (targetStage: DealStage) => {
    if (targetStage === currentStage) return;

    if (targetStage === "LOST") {
      setLostDialogOpen(true);
      return;
    }

    startTransition(async () => {
      const res = await updateDealStage({
        deal_id: deal.id,
        stage: targetStage,
      });

      if (res.success) {
        setCurrentStage(targetStage);
        if (targetStage === "WON") {
          toast.success(tDeals("wonSuccess"));
        } else {
          toast.success(tDeals("stageUpdated", { stage: tDeals(`stages.${targetStage}`) }));
        }
        router.refresh();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  const formattedValue = deal.estimated_value
    ? `${Number(deal.estimated_value).toLocaleString()} ${deal.currency || "EGP"}`
    : tDeals("notSpecified");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{tDeals("backToList")}</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {deal.business_id}
            </span>
            <DealStageBadge stage={currentStage} />
          </div>
          {deal.client && (
            <Link
              href={`/clients/${deal.client.id}`}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{deal.client.name}</span>
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/proposals/new?deal_id=${deal.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{tDeals("newProposal")}</span>
          </Link>

          {currentStage !== "WON" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStageClick("WON")}
              className="gap-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>{tDeals("markWon")}</span>
            </Button>
          )}

          {currentStage !== "LOST" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLostDialogOpen(true)}
              className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>{tDeals("markLost")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stage Stepper Progress Bar */}
      <Card className="p-3">
        <span className="text-xs font-bold text-muted-foreground block mb-2">
          {tDeals("stagesStepper")}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DEAL_STAGES.filter((s) => s !== "LOST" && s !== "LATER").map((st) => {
            const isCurrent = currentStage === st;
            return (
              <button
                key={st}
                onClick={() => handleStageClick(st)}
                className={`flex-1 min-w-28 py-2 px-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {tDeals(`stages.${st}`)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span>{tDeals("financialData")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">{tDeals("estimatedValue")}</span>
                <span className="font-bold text-sm text-foreground font-mono">
                  {formattedValue}
                </span>
              </div>

              {deal.won_date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{tDeals("closeDateWon")}</span>
                  <span className="font-medium text-emerald-600">
                    {deal.won_date}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{tDeals("ownerDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{tDeals("salesOwner")}</span>
                <span className="font-medium text-foreground">
                  {deal.sales_owner?.full_name || tDeals("notSpecified")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{tDeals("creationDate")}</span>
                <span className="font-medium text-foreground">
                  {new Date(deal.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Proposals & Activity Log (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          {deal.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{tDeals("dealNotes")}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground whitespace-pre-wrap">
                {deal.notes}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{tDeals("activityLog")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!deal.activities || deal.activities.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {tDeals("noActivitiesYet")}
                </p>
              ) : (
                <div className="space-y-3">
                  {deal.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-border bg-card/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {act.summary}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {act.notes && (
                        <p className="text-muted-foreground">{act.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LostDealDialog
        dealId={deal.id}
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        onSuccess={() => {
          setCurrentStage("LOST");
          router.refresh();
        }}
      />
    </div>
  );
}
