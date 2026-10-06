"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PotentialClientStatusBadge } from "./status-badge";
import { OpportunityBadges } from "./opportunity-badges";
import type { PotentialClientWithRelations } from "@/lib/actions/potential-clients";
import type { PotentialClientStatusType } from "@/lib/schemas/potential-client";

interface PotentialClientsTableProps {
  clients: PotentialClientWithRelations[];
  loading?: boolean;
  onStatusChange?: (id: string, newStatus: PotentialClientStatusType) => void;
  onRefresh?: () => void;
}

export function PotentialClientsTable({
  clients,
  loading = false,
  onStatusChange,
}: PotentialClientsTableProps) {
  const t = useTranslations("potentialClients");
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

  if (clients.length === 0) {
    return (
      <Card className="p-10 text-center flex flex-col items-center justify-center space-y-3 border-dashed">
        <div className="p-3 bg-muted rounded-full text-2xl">🕵️‍♂️</div>
        <h3 className="font-semibold text-lg text-foreground">{t("emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("emptySubtitle")}
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
              <TableHead className="w-24 font-semibold">{t("businessId")}</TableHead>
              <TableHead className="font-semibold">{t("name")}</TableHead>
              <TableHead className="font-semibold">{t("phone")}</TableHead>
              <TableHead className="font-semibold">{t("opportunities")}</TableHead>
              <TableHead className="w-32 font-semibold text-center">{tCommon("status")}</TableHead>
              <TableHead className="w-16 text-end"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const cleanPhone = client.phone?.replace(/[^0-9]/g, "");
              const whatsappUrl = cleanPhone
                ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
                : null;

              return (
                <TableRow
                  key={client.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Business ID */}
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    <Link
                      href={`/potential-clients/${client.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {client.business_id}
                    </Link>
                  </TableCell>

                  {/* Name & Area */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/potential-clients/${client.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <span>{client.name}</span>
                      </Link>
                      {client.area && (
                        <p className="text-xs text-muted-foreground">{client.area}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Phone & Quick Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {client.phone ? (
                        <>
                          <span className="text-xs font-mono text-foreground" dir="ltr">
                            {client.phone}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <a
                              href={`tel:${client.phone}`}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                              title={tCommon("call")}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                                title={tCommon("whatsapp")}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Opportunities */}
                  <TableCell>
                    <OpportunityBadges opportunities={client.opportunities || []} />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="text-center">
                    <PotentialClientStatusBadge
                      status={client.status as PotentialClientStatusType}
                      label={t(`status.${client.status}`)}
                    />
                  </TableCell>

                  {/* Actions Dropdown */}
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
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/potential-clients/${client.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>{tCommon("details")}</span>
                            </Link>
                          }
                        />

                        {onStatusChange && client.status !== "RESEARCHING" && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(client.id, "RESEARCHING")}
                            className="flex items-center gap-2 cursor-pointer text-amber-700 dark:text-amber-400"
                          >
                            <Clock className="h-4 w-4" />
                            <span>{t("statusActions.startResearch")}</span>
                          </DropdownMenuItem>
                        )}

                        {onStatusChange && client.status !== "RESEARCHED" && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(client.id, "RESEARCHED")}
                            className="flex items-center gap-2 cursor-pointer text-emerald-700 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{t("statusActions.finishResearch")}</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/potential-clients/${client.id}`}
                              className="flex items-center gap-2 cursor-pointer font-medium text-primary"
                            >
                              <span>🚀</span>
                              <span>{t("convert")}</span>
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
        {clients.map((client) => {
          const cleanPhone = client.phone?.replace(/[^0-9]/g, "");
          const whatsappUrl = cleanPhone
            ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
            : null;

          return (
            <Card
              key={client.id}
              className="p-3.5 space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    {client.business_id}
                  </span>
                  <Link
                    href={`/potential-clients/${client.id}`}
                    className="font-semibold text-foreground text-base hover:text-primary transition-colors"
                  >
                    {client.name}
                  </Link>
                  {client.area && (
                    <p className="text-xs text-muted-foreground">{client.area}</p>
                  )}
                </div>

                <PotentialClientStatusBadge
                  status={client.status as PotentialClientStatusType}
                  label={t(`status.${client.status}`)}
                />
              </div>

              {/* Opportunities */}
              <div>
                <OpportunityBadges opportunities={client.opportunities || []} />
              </div>

              {/* Actions & Links Bar */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 text-xs flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span dir="ltr">{client.phone}</span>
                    </a>
                  )}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs flex items-center gap-1"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{tCommon("whatsapp")}</span>
                    </a>
                  )}
                </div>

                <Link
                  href={`/potential-clients/${client.id}`}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
