"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  ShoppingBag,
  Download,
  Filter,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Store,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NexaLeadCard } from "./nexa-lead-card";
import { sounds } from "@/lib/utils/confetti-sound";
import { toast } from "sonner";
import {
  NEXA_VERTICAL_TYPES,
  NEXA_INTEREST_LEVELS,
} from "@/lib/schemas/nexa";
import type {
  NexaLead,
  NexaInterestLevel,
  NexaVerticalType,
  NexaLeadStatus,
} from "@/types/nexa";

interface NexaLeadsListProps {
  initialLeads: NexaLead[];
  onRefresh?: () => void;
}

export function NexaLeadsList({ initialLeads, onRefresh }: NexaLeadsListProps) {
  const t = useTranslations("nexa");
  const locale = useLocale();
  const isEn = locale === "en";

  const [leads, setLeads] = useState<NexaLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<string>("ALL");
  const [selectedVertical, setSelectedVertical] = useState<string>("ALL");

  React.useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        lead.brand_name.toLowerCase().includes(q) ||
        lead.contact_name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.area.toLowerCase().includes(q) ||
        lead.business_id.toLowerCase().includes(q);

      const matchesInterest =
        selectedInterest === "ALL" || lead.interest_level === selectedInterest;

      const matchesVertical =
        selectedVertical === "ALL" || lead.vertical_type === selectedVertical;

      return matchesQuery && matchesInterest && matchesVertical;
    });
  }, [leads, searchQuery, selectedInterest, selectedVertical]);

  const handleStatusChange = (id: string, newStatus: NexaLeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  // Export Leads to CSV with UTF-8 BOM
  const handleExportCsv = () => {
    sounds.playTactileClick();
    if (filteredLeads.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }

    const headers = isEn
      ? [
          "Lead ID",
          "Store / Brand Name",
          "Merchant Contact",
          "Role",
          "Phone",
          "Storefront / Social URL",
          "City",
          "Area",
          "Store Vertical",
          "Commerce Model",
          "Current System",
          "Monthly Order Volume",
          "Branches Count",
          "Target Nexa Plan",
          "Interest Level",
          "Estimated Budget (EGP)",
          "Next Action",
          "Next Action Date",
          "Status",
          "Registration Date",
        ]
      : [
          "كود العميل",
          "اسم المتجر / البراند",
          "اسم التاجر / المسؤول",
          "الصفة",
          "الهاتف",
          "المتجر أو السوشيال",
          "المدينة",
          "المنطقة",
          "نشاط المتجر",
          "نموذج التجارة",
          "السيستم الحالي",
          "حجم الطلبات الشهري",
          "عدد الفروع والمخازن",
          "باقة نكسا المستهدفة",
          "درجة الاهتمام",
          "الميزانية التقديرية",
          "الإجراء القادم",
          "تاريخ المتابعة",
          "الحالة",
          "تاريخ التسجيل",
        ];

    const rows = filteredLeads.map((l) => [
      l.business_id,
      `"${l.brand_name.replace(/"/g, '""')}"`,
      `"${l.contact_name.replace(/"/g, '""')}"`,
      `"${t(`roles.${l.contact_role}`)}"`,
      `"\t${l.phone}"`, // Tab forces Excel to treat as string
      `"${(l.store_url || "").replace(/"/g, '""')}"`,
      `"${l.city}"`,
      `"${l.area}"`,
      `"${t(`verticals.${l.vertical_type}`)}"`,
      `"${t(`commerceModels.${l.commerce_model}`)}"`,
      `"${t(`systems.${l.current_system}`)}"`,
      `"${l.monthly_order_volume ? t(`orderVolumes.${l.monthly_order_volume}`) : ""}"`,
      `"${l.branches_count}"`,
      `"${t(`plans.${l.plan_interest}`)}"`,
      `"${t(`interest.${l.interest_level}`)}"`,
      l.estimated_budget || 0,
      `"${(l.next_action || "").replace(/"/g, '""')}"`,
      l.next_action_date || "",
      `"${t(`statuses.${l.status}`)}"`,
      new Date(l.created_at).toLocaleDateString(locale),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexa-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t("exportSuccess", { count: filteredLeads.length }));
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9 h-10 text-xs sm:text-sm bg-background border-border/80"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Vertical Filter */}
          <select
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t("verticalType")}: {t("filterAll")}</option>
            {NEXA_VERTICAL_TYPES.map((v) => (
              <option key={v} value={v}>
                {t(`verticals.${v}`)}
              </option>
            ))}
          </select>

          {/* Interest Level Filter */}
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t("interestLevel")}: {t("filterAll")}</option>
            <option value="HOT">{t("interest.HOT")}</option>
            <option value="WARM">{t("interest.WARM")}</option>
            <option value="COLD">{t("interest.COLD")}</option>
          </select>

          {/* Export to Excel (CSV) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-10 px-3 text-xs gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">{t("exportCsv")}</span>
          </Button>

          {/* Refresh Data */}
          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title={t("refresh")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Count summary badge */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isEn
            ? `Showing ${filteredLeads.length} of ${leads.length} merchant leads`
            : `عرض ${filteredLeads.length} من أصل ${leads.length} عميل لمتجر مسجل`}
        </span>
      </div>

      {/* Leads Cards Grid or Empty State */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <NexaLeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/10 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">
              {t("noLeadsFoundTitle")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t("noLeadsFoundDesc")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
