"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ProposalStatus } from "@/lib/schemas/proposal";

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  const t = useTranslations("proposals.status");

  switch (status) {
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 text-xs"
        >
          {t("DRAFT")}
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs"
        >
          {t("PENDING_APPROVAL")}
        </Badge>
      );
    case "READY":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-xs"
        >
          {t("READY")}
        </Badge>
      );
    case "SENT":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 text-xs font-semibold"
        >
          {t("SENT")}
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs font-semibold"
        >
          {t("ACCEPTED")}
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 text-xs"
        >
          {t("REJECTED")}
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge
          variant="outline"
          className="bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20 text-xs"
        >
          {t("EXPIRED")}
        </Badge>
      );
    case "SUPERSEDED":
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border text-xs"
        >
          {t("SUPERSEDED")}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
}
