"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PotentialClientsFilter } from "./potential-clients-filter";
import { PotentialClientsTable } from "./potential-clients-table";
import { CreatePotentialClientDialog } from "./create-potential-client-dialog";
import {
  getPotentialClients,
  updatePotentialClientStatus,
  type PotentialClientWithRelations,
  type PaginatedResult,
} from "@/lib/actions/potential-clients";
import type { PotentialClientStatusType } from "@/lib/schemas/potential-client";

interface PotentialClientsClientProps {
  initialData?: PaginatedResult<PotentialClientWithRelations>;
}

export function PotentialClientsClient({ initialData }: PotentialClientsClientProps) {
  const t = useTranslations("potentialClients");
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PaginatedResult<PotentialClientWithRelations>>(
    initialData || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }
  );

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PotentialClientStatusType | "ALL">("ALL");

  const loadData = useCallback(
    (searchQuery = query, currentStatus = status, page = 1) => {
      startTransition(async () => {
        const res = await getPotentialClients({
          query: searchQuery || undefined,
          status: currentStatus === "ALL" ? undefined : currentStatus,
          page,
          pageSize: 20,
        });

        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || t("errorLoading"));
        }
      });
    },
    [query, status, t]
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(query, status, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, status, loadData]);

  const handleStatusChange = async (id: string, newStatus: PotentialClientStatusType) => {
    startTransition(async () => {
      const res = await updatePotentialClientStatus(id, newStatus);
      if (res.success) {
        toast.success(t("statusUpdated"));
        loadData(query, status, data.page);
      } else {
        toast.error(res.error || t("errorUpdatingStatus"));
      }
    });
  };

  const handleReset = () => {
    setQuery("");
    setStatus("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {data.total}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <CreatePotentialClientDialog onSuccess={() => loadData(query, status, 1)} />
      </div>

      {/* Filter and Search Bar */}
      <PotentialClientsFilter
        searchQuery={query}
        onSearchChange={setQuery}
        selectedStatus={status}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Results Table */}
      <PotentialClientsTable
        clients={data.items}
        loading={isPending}
        onStatusChange={handleStatusChange}
        onRefresh={() => loadData(query, status, data.page)}
      />
    </div>
  );
}
