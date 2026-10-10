"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, Building2, Briefcase, FileText } from "lucide-react";
import { ProposalStatusBadge } from "./proposal-status-badge";
import type { ProposalWithRelations } from "@/lib/actions/proposals";

interface ProposalsTableProps {
  proposals: ProposalWithRelations[];
}

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  const t = useTranslations("proposals");
  const tTable = useTranslations("proposals.table");

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
        <div className="p-3 rounded-full bg-muted text-muted-foreground mb-3">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t("emptyTable")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {t("emptyTableSubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3.5">{tTable("code")}</th>
              <th className="p-3.5">{tTable("client")}</th>
              <th className="p-3.5">{tTable("deal")}</th>
              <th className="p-3.5 text-center">{tTable("version")}</th>
              <th className="p-3.5 text-center">{tTable("status")}</th>
              <th className="p-3.5 text-left">{tTable("total")}</th>
              <th className="p-3.5 text-center">{tTable("issueDate")}</th>
              <th className="p-3.5 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {proposals.map((proposal) => {
              const currentVer = proposal.current_version;
              const formattedDate = new Date(proposal.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <tr
                  key={proposal.id}
                  className="hover:bg-muted/40 transition-colors group cursor-pointer"
                >
                  <td className="p-3.5 font-bold font-mono text-primary">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="hover:underline"
                    >
                      {proposal.business_id}
                    </Link>
                  </td>

                  <td className="p-3.5">
                    {proposal.client ? (
                      <Link
                        href={`/clients/${proposal.client.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{proposal.client.name}</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {proposal.deal ? (
                      <Link
                        href={`/deals/${proposal.deal.id}`}
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                      >
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{proposal.deal.title}</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-semibold">
                      v{currentVer?.version_number || 1}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    {currentVer ? (
                      <ProposalStatusBadge status={currentVer.status} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-left font-mono font-bold text-foreground">
                    {Number(currentVer?.grand_total || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {currentVer?.currency || "EGP"}
                  </td>

                  <td className="p-3.5 text-center text-muted-foreground font-mono">
                    {formattedDate}
                  </td>

                  <td className="p-3.5 text-center">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={t("viewDetails")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
