"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/utils/export-csv";

interface RepPerformanceRow {
  name: string;
  dealsWon: number;
  revenueWon: string;
  openPipeline: string;
  rate: string;
  rawWon: number;
}

interface ReportsExportButtonProps {
  repsPerformance: RepPerformanceRow[];
  closedRevenue: number;
  openPipeline: number;
}

export function ReportsExportButton({
  repsPerformance,
  closedRevenue,
  openPipeline,
}: ReportsExportButtonProps) {
  const t = useTranslations("reports");

  const handleExport = () => {
    exportToCsv(
      `Nile_Nexus_Sales_Report_${new Date().toISOString().slice(0, 10)}`,
      [
        { header: "مسؤول المبيعات / Representative", key: "name" },
        { header: "الصفقات الرابحة / Deals Won", key: "dealsWon" },
        { header: "الإيرادات المحققة / Closed Revenue", key: "revenueWon" },
        { header: "البايبلاين المفتوح / Active Pipeline", key: "openPipeline" },
        { header: "نسبة التحويل / Conversion Rate", key: "rate" },
      ],
      repsPerformance
    );
    toast.success(t("exportSuccess") || "تم تصدير تقرير المبيعات إلى Excel بنجاح! 📊");
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2 text-xs h-9 cursor-pointer"
    >
      <Download className="h-4 w-4" />
      <span>{t("exportExcel")}</span>
    </Button>
  );
}
