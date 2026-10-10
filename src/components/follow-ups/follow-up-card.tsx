"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Calendar,
  Phone,
  MessageSquare,
  Building2,
  Briefcase,
  CheckCircle2,
  CalendarClock,
  AlertCircle,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowUpActionBadge } from "./follow-up-action-badge";
import { CompleteFollowUpDialog } from "./complete-follow-up-dialog";
import { RescheduleFollowUpDialog } from "./reschedule-follow-up-dialog";
import type { FollowUpWithRelations } from "@/lib/actions/follow-ups";

interface FollowUpCardProps {
  followUp: FollowUpWithRelations;
  onRefresh?: () => void;
  isOverdue?: boolean;
}

export function FollowUpCard({ followUp, onRefresh, isOverdue = false }: FollowUpCardProps) {
  const tCard = useTranslations("followUps.card");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const dueDate = new Date(followUp.due_at);

  const formattedDate = dueDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = dueDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rawPhone = followUp.client?.phone || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone}`
    : null;

  return (
    <>
      <Card
        className={`p-4 transition-all border ${
          isOverdue
            ? "border-rose-500/30 bg-rose-500/[0.02] shadow-sm shadow-rose-500/5"
            : "border-border hover:border-border/80 bg-card"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Top Info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <FollowUpActionBadge action={followUp.action} />

              {isOverdue && (
                <Badge
                  variant="outline"
                  className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs font-semibold gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{tCard("overdueBadge")}</span>
                </Badge>
              )}

              {followUp.status === "COMPLETED" && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{tCard("completedBadge")}</span>
                </Badge>
              )}

              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" />
                {formattedDate} {formattedTime}
              </span>
            </div>

            {/* Client & Deal Links */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm">
              {followUp.client && (
                <Link
                  href={`/clients/${followUp.client.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{followUp.client.name}</span>
                </Link>
              )}

              {followUp.deal && (
                <Link
                  href={`/deals/${followUp.deal.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Briefcase className="h-3 w-3" />
                  <span>{tCard("dealPrefix", { title: followUp.deal.title })}</span>
                </Link>
              )}
            </div>

            {/* Notes / Objective */}
            {followUp.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                {followUp.notes}
              </p>
            )}

            {/* Completion Result if Completed */}
            {followUp.status === "COMPLETED" && followUp.completion_result && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold block mb-0.5">{tCard("followUpResult")}</span>
                <p className="leading-relaxed">{followUp.completion_result}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
            {/* Quick Contacts (Call / WhatsApp) */}
            <div className="flex items-center gap-1.5">
              {followUp.client?.phone && (
                <a
                  href={`tel:${followUp.client.phone}`}
                  className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                  title={tCard("callAction")}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/30 transition-colors"
                  title={tCard("whatsappAction")}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Workflow Buttons (Pending) */}
            {followUp.status === "PENDING" && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setRescheduleDialogOpen(true)}
                  className="text-xs h-7 gap-1"
                >
                  <CalendarClock className="h-3 w-3" />
                  <span>{tCard("reschedule")}</span>
                </Button>

                <Button
                  size="xs"
                  onClick={() => setCompleteDialogOpen(true)}
                  className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{tCard("complete")}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Responsible Person Footer */}
        {followUp.responsible && (
          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {tCard("responsiblePrefix", { name: followUp.responsible.full_name || followUp.responsible.email })}
            </span>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <CompleteFollowUpDialog
        followUp={followUp}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onSuccess={onRefresh}
      />

      <RescheduleFollowUpDialog
        followUp={followUp}
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
