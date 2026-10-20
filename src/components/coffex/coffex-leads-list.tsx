"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Coffee,
  Download,
  Filter,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoffexLeadCard } from "./coffex-lead-card";
import { sounds } from "@/lib/utils/confetti-sound";
import { toast } from "sonner";
import type {
  CoffexLead,
  CoffexInterestLevel,
  CoffexActivityType,
  CoffexLeadStatus,
} from "@/types/coffex";

interface CoffexLeadsListProps {
  initialLeads: CoffexLead[];
  onRefresh?: () => void;
}

export function CoffexLeadsList({ initialLeads, onRefresh }: CoffexLeadsListProps) {
  const t = useTranslations("coffex");
  const locale = useLocale();
  const isEn = locale === "en";

  const [leads, setLeads] = useState<CoffexLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<string>("ALL");
  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");

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

      const matchesActivity =
        selectedActivity === "ALL" || lead.activity_type === selectedActivity;

      return matchesQuery && matchesInterest && matchesActivity;
    });
  }, [leads, searchQuery, selectedInterest, selectedActivity]);

  const handleStatusChange = (id: string, newStatus: CoffexLeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  // Export Leads to CSV with UTF-8 BOM
  const handleExportCsv = () => {
    sounds.playTactileClick();
    if (filteredLeads.length === 0) {
      toast.error(isEn ? "No leads to export" : "لا توجد بيانات للتصدير");
      return;
    }

    const headers = [
      "Business ID",
      "Brand / Cafe Name",
      "Contact Person",
      "Role",
      "Phone",
      "City",
      "Area",
      "Activity Type",
      "Branches Count",
      "Current System",
      "Interest Level",
      "Estimated Budget (EGP)",
      "Next Action",
      "Next Action Date",
      "Status",
      "GPS Map Link",
      "Created At",
    ];

    const rows = filteredLeads.map((l) => [
      l.business_id,
      `"${l.brand_name.replace(/"/g, '""')}"`,
      `"${l.contact_name.replace(/"/g, '""')}"`,
      l.contact_role,
      `"${l.phone}"`,
      `"${l.city}"`,
      `"${l.area}"`,
      l.activity_type,
      l.branches_count,
      l.current_system,
      l.interest_level,
      l.estimated_budget || 0,
      `"${(l.next_action || "").replace(/"/g, '""')}"`,
      l.next_action_date || "",
      l.status,
      l.gps_maps_url || "",
      new Date(l.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `coffex_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      isEn
        ? `Exported ${filteredLeads.length} Coffex leads to Excel/CSV!`
        : `تم تصدير ${filteredLeads.length} عميل كوفيكس إلى إكسيل بنجاح!`
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute start-3 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9 h-10 text-xs bg-background"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interest Level Filter */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => {
                sounds.playTactileClick();
                setSelectedInterest("ALL");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedInterest === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("filterAll")}
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTactileClick();
                setSelectedInterest("HOT");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                selectedInterest === "HOT"
                  ? "bg-red-500 text-white shadow-xs"
                  : "text-red-600 dark:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>{t("interest.HOT")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTactileClick();
                setSelectedInterest("WARM");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                selectedInterest === "WARM"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>{t("interest.WARM")}</span>
            </button>
          </div>

          {/* Export Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-10 text-xs gap-1.5 border-border hover:bg-muted font-semibold cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("exportCsv")}</span>
          </Button>

          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                sounds.playTactileClick();
                onRefresh();
              }}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
              title={t("refresh")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <CoffexLeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Coffee className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            {t("noLeadsFoundTitle")}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("noLeadsFoundDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
