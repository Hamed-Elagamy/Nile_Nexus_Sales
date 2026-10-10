"use client";

import React, { useState, useTransition, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProposalsFilter } from "./proposals-filter";
import { ProposalsTable } from "./proposals-table";
import {
  getProposals,
  type PaginatedProposalsResult,
} from "@/lib/actions/proposals";
import type { ProposalStatus } from "@/lib/schemas/proposal";

interface ProposalsClientProps {
  initialData?: PaginatedProposalsResult;
}

export function ProposalsClient({ initialData }: ProposalsClientProps) {
  const t = useTranslations("proposals");
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PaginatedProposalsResult>(
    initialData || {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }
  );

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | undefined>();

  const loadData = useCallback(
    (search = query, status = selectedStatus, page = 1) => {
      startTransition(async () => {
        const res = await getProposals({
          query: search || undefined,
          status,
          page,
          pageSize: 20,
        });

        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || t("loadFailed"));
        }
      });
    },
    [query, selectedStatus, t]
  );

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    loadData(newQuery, selectedStatus, 1);
  };

  const handleStatusChange = (newStatus?: ProposalStatus) => {
    setSelectedStatus(newStatus);
    loadData(query, newStatus, 1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <ProposalsFilter
        onSearch={handleSearch}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Loading state indicator */}
      {isPending && (
        <div className="text-center py-2 text-xs text-muted-foreground animate-pulse">
          {t("updatingData")}
        </div>
      )}

      {/* Table */}
      <ProposalsTable proposals={data.items} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t("pagination.pageOf", { page: data.page, totalPages: data.totalPages, total: data.total })}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(query, selectedStatus, data.page - 1)}
              disabled={data.page <= 1 || isPending}
              className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted"
            >
              {t("pagination.previous")}
            </button>
            <button
              onClick={() => loadData(query, selectedStatus, data.page + 1)}
              disabled={data.page >= data.totalPages || isPending}
              className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted"
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
