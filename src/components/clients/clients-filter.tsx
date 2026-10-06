"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, X, Building2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClientType } from "@/lib/schemas/client";

interface ClientsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType?: ClientType | "ALL";
  onTypeChange: (type: ClientType | "ALL") => void;
  onReset: () => void;
}

export function ClientsFilter({
  searchQuery,
  onSearchChange,
  selectedType = "ALL",
  onTypeChange,
  onReset,
}: ClientsFilterProps) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");

  const hasActiveFilters = searchQuery.trim() !== "" || selectedType !== "ALL";

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

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => onTypeChange("ALL")}
          className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border ${
            selectedType === "ALL"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
          }`}
        >
          {t("allClients")}
        </button>

        <button
          onClick={() => onTypeChange("COMPANY")}
          className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border flex items-center gap-1.5 ${
            selectedType === "COMPANY"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
          }`}
        >
          <Building2 className="h-3 w-3" />
          <span>{t("type.COMPANY")}</span>
        </button>

        <button
          onClick={() => onTypeChange("INDIVIDUAL")}
          className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border flex items-center gap-1.5 ${
            selectedType === "INDIVIDUAL"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
          }`}
        >
          <User className="h-3 w-3" />
          <span>{t("type.INDIVIDUAL")}</span>
        </button>
      </div>
    </div>
  );
}
