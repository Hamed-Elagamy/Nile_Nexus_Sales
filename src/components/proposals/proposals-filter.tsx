"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type ProposalStatus } from "@/lib/schemas/proposal";

interface ProposalsFilterProps {
  onSearch: (query: string) => void;
  selectedStatus?: ProposalStatus;
  onStatusChange: (status?: ProposalStatus) => void;
}

export function ProposalsFilter({
  onSearch,
  selectedStatus,
  onStatusChange,
}: ProposalsFilterProps) {
  const t = useTranslations("proposals.filter");
  const tStatus = useTranslations("proposals.status");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
  };

  const statusOptions: Array<{ id?: ProposalStatus; label: string }> = [
    { id: undefined, label: t("allStatuses") },
    { id: "DRAFT", label: tStatus("DRAFT") },
    { id: "SENT", label: tStatus("SENT") },
    { id: "ACCEPTED", label: tStatus("ACCEPTED") },
    { id: "REJECTED", label: tStatus("REJECTED") },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          className="pr-9 h-9 text-xs"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {statusOptions.map((opt) => {
          const isActive = selectedStatus === opt.id;
          return (
            <button
              key={opt.label}
              onClick={() => onStatusChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
