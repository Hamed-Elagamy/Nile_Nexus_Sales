"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  POTENTIAL_CLIENT_STATUSES,
  type PotentialClientStatusType,
} from "@/lib/schemas/potential-client";

interface PotentialClientsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus?: PotentialClientStatusType | "ALL";
  onStatusChange: (status: PotentialClientStatusType | "ALL") => void;
  onReset: () => void;
}

export function PotentialClientsFilter({
  searchQuery,
  onSearchChange,
  selectedStatus = "ALL",
  onStatusChange,
  onReset,
}: PotentialClientsFilterProps) {
  const t = useTranslations("potentialClients");
  const tCommon = useTranslations("common");

  const statuses: Array<PotentialClientStatusType | "ALL"> = [
    "ALL",
    ...POTENTIAL_CLIENT_STATUSES.filter((s) => s !== "ARCHIVED"),
  ];

  const hasActiveFilters = searchQuery.trim() !== "" || selectedStatus !== "ALL";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-9 pe-8 h-10 bg-card rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 text-xs text-muted-foreground hover:text-foreground"
          >
            {tCommon("cancel")}
          </Button>
        )}
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((st) => {
          const isSelected = selectedStatus === st;
          const label = st === "ALL" ? t("allStatuses") : t(`status.${st}`);

          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
