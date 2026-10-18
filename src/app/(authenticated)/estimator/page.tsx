"use client";

import React, { useState } from "react";
import { ProjectEstimatorDialog } from "@/components/sales/project-estimator-dialog";
import { Button } from "@/components/ui/button";
import { Calculator, Sparkles, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function EstimatorPage() {
  const [open, setOpen] = useState(true);
  const t = useTranslations("estimator");
  const tNav = useTranslations("nav");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <span className="text-xs font-semibold text-primary">{t("breadcrumb")}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Button onClick={() => setOpen(true)} className="gap-2 cursor-pointer">
          <Calculator className="h-4 w-4" />
          <span>{t("openInteractive")}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-card/60 backdrop-blur-xs space-y-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-base">{t("feature1Title")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("feature1Desc")}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card/60 backdrop-blur-xs space-y-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-base">{t("feature2Title")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("feature2Desc")}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card/60 backdrop-blur-xs space-y-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Calculator className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-base">{t("feature3Title")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("feature3Desc")}
          </p>
        </div>
      </div>

      <ProjectEstimatorDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
