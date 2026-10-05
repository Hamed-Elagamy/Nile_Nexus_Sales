"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Kanban } from "lucide-react";
import { DealsFilter } from "./deals-filter";
import { DealsTable } from "./deals-table";
import { CreateDealDialog } from "./create-deal-dialog";
import {
  getDeals,
  type PaginatedDealsResult,
} from "@/lib/actions/deals";
import type { DealStage } from "@/lib/schemas/deal";

interface DealsClientProps {
  initialData?: PaginatedDealsResult;
  clients?: Array<{ id: string; name: string; business_id: string }>;
}

export function DealsClient({ initialData, clients = [] }: DealsClientProps) {
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PaginatedDealsResult>(
    initialData || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }
  );

  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<DealStage | "ALL">("ALL");

  const loadData = useCallback(
    (searchQuery = query, currentStage = stage, page = 1) => {
      startTransition(async () => {
        const res = await getDeals({
          query: searchQuery || undefined,
          stage: currentStage === "ALL" ? undefined : currentStage,
          page,
          pageSize: 20,
        });

        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "فشل تحميل الصفقات");
        }
      });
    },
    [query, stage]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(query, stage, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, stage, loadData]);

  const handleReset = () => {
    setQuery("");
    setStage("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              الصفقات
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {data.total}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة جميع الفرص والصفقات التجارية ومتابعة مراحلها 💼
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>عرض البايبلاين (Kanban)</span>
          </Link>

          <CreateDealDialog
            clients={clients}
            onSuccess={() => loadData(query, stage, 1)}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <DealsFilter
        searchQuery={query}
        onSearchChange={setQuery}
        selectedStage={stage}
        onStageChange={setStage}
        onReset={handleReset}
      />

      {/* Results Table */}
      <DealsTable deals={data.items} loading={isPending} />
    </div>
  );
}
