"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ClientsFilter } from "./clients-filter";
import { ClientsTable } from "./clients-table";
import { CreateClientDialog } from "./create-client-dialog";
import {
  getClients,
  type PaginatedClientsResult,
} from "@/lib/actions/clients";
import type { ClientType } from "@/lib/schemas/client";

interface ClientsClientProps {
  initialData?: PaginatedClientsResult;
}

export function ClientsClient({ initialData }: ClientsClientProps) {
  const t = useTranslations("clients");
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PaginatedClientsResult>(
    initialData || { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }
  );

  const [query, setQuery] = useState("");
  const [type, setType] = useState<ClientType | "ALL">("ALL");

  const loadData = useCallback(
    (searchQuery = query, currentType = type, page = 1) => {
      startTransition(async () => {
        const res = await getClients({
          query: searchQuery || undefined,
          type: currentType === "ALL" ? undefined : currentType,
          page,
          pageSize: 20,
        });

        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "فشل تحميل العملاء");
        }
      });
    },
    [query, type]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(query, type, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, type, loadData]);

  const handleReset = () => {
    setQuery("");
    setType("ALL");
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

        <CreateClientDialog onSuccess={() => loadData(query, type, 1)} />
      </div>

      {/* Filter and Search Bar */}
      <ClientsFilter
        searchQuery={query}
        onSearchChange={setQuery}
        selectedType={type}
        onTypeChange={setType}
        onReset={handleReset}
      />

      {/* Results Table */}
      <ClientsTable clients={data.items} loading={isPending} />
    </div>
  );
}
