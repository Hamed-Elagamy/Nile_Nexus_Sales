"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, AlertCircle, Clock, CheckCircle2, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TaskPriority, TaskStatus } from "@/types/domain";

interface TasksFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  counts: {
    total: number;
    urgent: number;
    inProgress: number;
    done: number;
    todo: number;
  };
}

export function TasksFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  counts,
}: TasksFilterBarProps) {
  const t = useTranslations("tasks");

  const tabs = [
    { key: "ALL", label: t("filter.all"), count: counts.total },
    { key: "URGENT", label: t("filter.urgent"), count: counts.urgent, icon: AlertCircle, isUrgentTab: true },
    { key: "IN_PROGRESS", label: t("filter.inProgress"), count: counts.inProgress, icon: Clock },
    { key: "TODO", label: t("filter.todo"), count: counts.todo },
    { key: "DONE", label: t("filter.done"), count: counts.done, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-3">
      {/* Search & Priority Selector Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pr-9 h-9 text-xs w-full"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ListFilter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="w-full sm:w-36 h-9 rounded-md border border-input bg-card px-2.5 text-xs focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="ALL">كل الأولويات</option>
            <option value="URGENT">{t("priority.URGENT")}</option>
            <option value="IMPORTANT">{t("priority.IMPORTANT")}</option>
            <option value="NORMAL">{t("priority.NORMAL")}</option>
          </select>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? tab.isUrgentTab
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30"
                    : "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-card hover:bg-muted/60 text-muted-foreground border border-border/60"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? tab.isUrgentTab
                      ? "bg-red-600 text-white"
                      : "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
