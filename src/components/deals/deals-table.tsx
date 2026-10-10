"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink, ChevronRight, MoreVertical, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DealStageBadge } from "./deal-stage-badge";
import type { DealWithRelations } from "@/lib/actions/deals";
import type { DealStage } from "@/lib/schemas/deal";

interface DealsTableProps {
  deals: DealWithRelations[];
  loading?: boolean;
}

export function DealsTable({ deals, loading = false }: DealsTableProps) {
  const tDeals = useTranslations("deals");
  const tCommon = useTranslations("common");

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="p-10 text-center flex flex-col items-center justify-center space-y-3 border-dashed">
        <div className="p-3 bg-muted rounded-full text-2xl">💼</div>
        <h3 className="font-semibold text-lg text-foreground">{tDeals("emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {tDeals("emptySubtitle")}
        </p>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-24 font-semibold">{tDeals("table.code")}</TableHead>
              <TableHead className="font-semibold">{tDeals("table.title")}</TableHead>
              <TableHead className="font-semibold">{tDeals("table.client")}</TableHead>
              <TableHead className="w-32 font-semibold text-center">{tDeals("table.stage")}</TableHead>
              <TableHead className="font-semibold">{tDeals("table.estimatedValue")}</TableHead>
              <TableHead className="font-semibold">{tDeals("table.owner")}</TableHead>
              <TableHead className="w-16 text-end"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => {
              const formattedValue = deal.estimated_value
                ? `${Number(deal.estimated_value).toLocaleString()} ${deal.currency || "EGP"}`
                : "-";

              return (
                <TableRow
                  key={deal.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {deal.business_id}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {deal.title}
                    </Link>
                  </TableCell>

                  <TableCell>
                    {deal.client ? (
                      <Link
                        href={`/clients/${deal.client.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                      >
                        <Building2 className="h-3 w-3" />
                        <span>{deal.client.name}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <DealStageBadge stage={deal.stage as DealStage} />
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold">
                    {formattedValue}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {deal.sales_owner?.full_name || "-"}
                  </TableCell>

                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/deals/${deal.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>{tCommon("details")}</span>
                            </Link>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Optimized Card View */}
      <div className="md:hidden space-y-3">
        {deals.map((deal) => {
          const formattedValue = deal.estimated_value
            ? `${Number(deal.estimated_value).toLocaleString()} ${deal.currency || "EGP"}`
            : "-";

          return (
            <Card
              key={deal.id}
              className="p-3.5 space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    {deal.business_id}
                  </span>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="font-semibold text-foreground text-base hover:text-primary transition-colors"
                  >
                    {deal.title}
                  </Link>
                  {deal.client && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      🏢 {deal.client.name}
                    </p>
                  )}
                </div>

                <DealStageBadge stage={deal.stage as DealStage} />
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-foreground">
                  {formattedValue}
                </span>

                <Link
                  href={`/deals/${deal.id}`}
                  className="p-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <span>{tDeals("viewDetails")}</span>
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
