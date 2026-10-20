"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Coffee,
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
import { CoffexOnsiteForm } from "@/components/coffex/coffex-onsite-form";
import { CoffexLeadsList } from "@/components/coffex/coffex-leads-list";
import { sounds } from "@/lib/utils/confetti-sound";
import type { CoffexLead, CoffexMetrics } from "@/types/coffex";

interface CoffexClientPageProps {
  initialLeads: CoffexLead[];
  initialMetrics: CoffexMetrics;
}

export function CoffexClientPage({
  initialLeads,
  initialMetrics,
}: CoffexClientPageProps) {
  const t = useTranslations("coffex");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isEn = locale === "en";

  const [activeTab, setActiveTab] = useState<"form" | "directory">("form");
  const [leads, setLeads] = useState<CoffexLead[]>(initialLeads);
  const [metrics, setMetrics] = useState<CoffexMetrics>(initialMetrics);

  const handleLeadCreated = (newLead: CoffexLead) => {
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
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t("breadcrumb")}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{t("pageTitle")}</span>
              <Coffee className="h-6 w-6 text-amber-600 stroke-[2.2]" />
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 text-xs font-bold"
            >
              {t("onsiteBadge")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Tab Switcher in Header */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playTactileClick();
              setActiveTab("form");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "form"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t("tabForm")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTactileClick();
              setActiveTab("directory");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "directory"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>{t("tabDirectory")}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "directory"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {leads.length}
            </span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Leads */}
        <div className="p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t("kpiTotalLeads")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Coffee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={metrics.totalLeads} />
          </div>
        </div>

        {/* Card 2: Hot Leads */}
        <div className="p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t("kpiHotLeads")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            <AnimatedCounter value={metrics.hotLeadsCount} />
          </div>
        </div>

        {/* Card 3: Branches Targeted */}
        <div className="p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t("kpiBranches")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={metrics.totalBranchesCount} />
          </div>
        </div>

        {/* Card 4: Estimated Pipeline Value */}
        <div className="p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xs space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t("kpiPipelineValue")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
            <AnimatedCounter value={metrics.estimatedPipelineValue} />
            <span className="text-xs font-normal text-muted-foreground">
              {t("currency")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "form" ? (
        <CoffexOnsiteForm onSuccess={handleLeadCreated} />
      ) : (
        <CoffexLeadsList initialLeads={leads} />
      )}
    </div>
  );
}
