"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEAL_STAGES, type DealStage } from "@/lib/schemas/deal";

interface DealsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage?: DealStage | "ALL";
  onStageChange: (stage: DealStage | "ALL") => void;
  onReset: () => void;
}

export function DealsFilter({
  searchQuery,
  onSearchChange,
  selectedStage = "ALL",
  onStageChange,
  onReset,
}: DealsFilterProps) {
  const tCommon = useTranslations("common");
  const hasActiveFilters = searchQuery.trim() !== "" || selectedStage !== "ALL";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بعنوان الصفقة، الكود، أو العميل..."
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

      {/* Stage Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onStageChange("ALL")}
          className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border ${
            selectedStage === "ALL"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
          }`}
        >
          كل الصفقات
        </button>

        {DEAL_STAGES.map((st) => (
          <button
            key={st}
            onClick={() => onStageChange(st)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap font-medium border ${
              selectedStage === st
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border"
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
}
