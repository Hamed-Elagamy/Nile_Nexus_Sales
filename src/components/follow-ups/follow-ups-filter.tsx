"use client";

import React from "react";
import { AlertCircle, Calendar, CalendarCheck2, Clock, ListFilter } from "lucide-react";

interface FollowUpsFilterProps {
  currentTab: "TODAY" | "OVERDUE" | "UPCOMING" | "COMPLETED" | "ALL";
  onTabChange: (tab: "TODAY" | "OVERDUE" | "UPCOMING" | "COMPLETED" | "ALL") => void;
  counts: {
    today: number;
    overdue: number;
    upcoming: number;
    completed: number;
    all: number;
  };
  currentAction?: string;
  onActionChange: (action?: string) => void;
}

export function FollowUpsFilter({
  currentTab,
  onTabChange,
  counts,
  currentAction,
  onActionChange,
}: FollowUpsFilterProps) {
  const tabs = [
    {
      id: "TODAY" as const,
      label: "اليوم",
      icon: Calendar,
      count: counts.today,
      countClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      id: "OVERDUE" as const,
      label: "متأخرة",
      icon: AlertCircle,
      count: counts.overdue,
      countClass:
        counts.overdue > 0
          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
          : "bg-muted text-muted-foreground",
    },
    {
      id: "UPCOMING" as const,
      label: "القادمة",
      icon: Clock,
      count: counts.upcoming,
      countClass: "bg-muted text-muted-foreground",
    },
    {
      id: "COMPLETED" as const,
      label: "المكتملة",
      icon: CalendarCheck2,
      count: counts.completed,
      countClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      id: "ALL" as const,
      label: "الكل",
      icon: ListFilter,
      count: counts.all,
      countClass: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : tab.countClass
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Type Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={currentAction || ""}
          onChange={(e) => onActionChange(e.target.value || undefined)}
          className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
        >
          <option value="">جميع أنواع الإجراءات</option>
          <option value="CALL">اتصال هاتف</option>
          <option value="MEETING">اجتماع</option>
          <option value="WHATSAPP">واتساب</option>
          <option value="EMAIL">إيميل</option>
          <option value="VISIT">زيارة ميدانية</option>
        </select>
      </div>
    </div>
  );
}
