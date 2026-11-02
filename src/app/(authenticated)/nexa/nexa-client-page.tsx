"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShoppingBag,
  ArrowLeft,
  Flame,
  PlusCircle,
  ListFilter,
  Building2,
  Coins,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { NexaOnsiteForm } from "@/components/nexa/nexa-onsite-form";
import { NexaLeadsList } from "@/components/nexa/nexa-leads-list";
import { sounds } from "@/lib/utils/confetti-sound";
import type { NexaLead, NexaMetrics } from "@/types/nexa";

interface NexaClientPageProps {
  initialLeads: NexaLead[];
  initialMetrics: NexaMetrics;
}

export function NexaClientPage({
  initialLeads,
  initialMetrics,
}: NexaClientPageProps) {
  const t = useTranslations("nexa");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isEn = locale === "en";

  const [activeTab, setActiveTab] = useState<"form" | "directory">("form");
  const [leads, setLeads] = useState<NexaLead[]>(initialLeads);
  const [metrics, setMetrics] = useState<NexaMetrics>(initialMetrics);

  const handleLeadCreated = (newLead: NexaLead) => {
    setLeads((prev) => [newLead, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      totalLeads: prev.totalLeads + 1,
      hotLeadsCount:
        newLead.interest_level === "HOT"
          ? prev.hotLeadsCount + 1
          : prev.hotLeadsCount,
      totalBranchesCount:
        prev.totalBranchesCount +
        (newLead.branches_count === "1"
          ? 1
          : newLead.branches_count === "2-3"
          ? 3
          : newLead.branches_count === "4-6"
          ? 5
          : 8),
      estimatedPipelineValue:
        prev.estimatedPipelineValue + (Number(newLead.estimated_budget) || 0),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span>{tNav("dashboard")}</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-semibold text-primary">
              {t("breadcrumb")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {t("pageTitle")}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("pageSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-muted/60 border border-border/60 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playTactileClick();
              setActiveTab("form");
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{t("tabForm")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTactileClick();
              setActiveTab("directory");
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>{t("tabDirectory")}</span>
            <Badge
              variant="outline"
              className={`ms-1 text-[10px] px-1.5 py-0 ${
                activeTab === "directory"
                  ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                  : "bg-muted text-foreground border-border"
              }`}
            >
              {leads.length}
            </Badge>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t("kpiTotalLeads")}
            </p>
            <h4 className="text-xl sm:text-2xl font-black text-foreground mt-0.5 font-mono">
              <AnimatedCounter value={metrics.totalLeads} />
            </h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Hot Leads (Priority Deals) */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t("kpiHotLeads")}
            </p>
            <h4 className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-0.5 font-mono">
              <AnimatedCounter value={metrics.hotLeadsCount} />
            </h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        {/* Total Branches Count */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t("kpiBranches")}
            </p>
            <h4 className="text-xl sm:text-2xl font-black text-foreground mt-0.5 font-mono">
              <AnimatedCounter value={metrics.totalBranchesCount} />
            </h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Estimated Pipeline Value */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {t("kpiPipelineValue")}
            </p>
            <h4 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              <AnimatedCounter value={metrics.estimatedPipelineValue} />{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("currency")}
              </span>
            </h4>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "form" ? (
        <NexaOnsiteForm onSuccess={handleLeadCreated} />
      ) : (
        <NexaLeadsList initialLeads={leads} />
      )}
    </div>
  );
}
