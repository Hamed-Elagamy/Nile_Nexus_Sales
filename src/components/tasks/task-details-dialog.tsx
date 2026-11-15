"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  CheckSquare,
  AlertCircle,
  User,
  Clock,
  Building,
  Briefcase,
  CheckCircle2,
  Calendar,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TaskWithRelations } from "@/types/task";

interface TaskDetailsDialogProps {
  task: TaskWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onToggleStatus?: (task: TaskWithRelations) => void;
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
}: TaskDetailsDialogProps) {
  const t = useTranslations("tasks");

  if (!task) return null;

  const isDone = task.status === "DONE";
  const isUrgent = task.priority === "URGENT";
  const isImportant = task.priority === "IMPORTANT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge
              variant={
                isUrgent ? "destructive" : isImportant ? "default" : "secondary"
              }
            >
              {t(`priority.${task.priority}`)}
            </Badge>
            <Badge
              variant="outline"
              className={
                isDone
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : task.status === "IN_PROGRESS"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {t(`status.${task.status}`)}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("dialog.detailsTitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Notes / Description */}
          {task.notes ? (
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {task.notes}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              {t("dialog.notesPlaceholder")}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/60">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[10px]">{t("assignedTo")}</span>
                <span className="font-semibold text-foreground">
                  {task.assignee?.full_name || "—"}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[10px]">{t("dueDate")}</span>
                <span className="font-medium text-foreground">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleString("ar-EG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Client */}
            {task.client && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t("client")}</span>
                  <span className="font-medium text-foreground">{task.client.name}</span>
                </div>
              </div>
            )}

            {/* Deal */}
            {task.deal && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">{t("deal")}</span>
                  <span className="font-medium text-foreground">{task.deal.title}</span>
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[10px]">تاريخ الإنشاء</span>
                <span className="font-mono text-muted-foreground">
                  {new Date(task.created_at).toISOString().split("T")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit?.(task);
              }}
              className="gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{t("actions.edit")}</span>
            </Button>

            <Button
              size="sm"
              variant={isDone ? "outline" : "default"}
              onClick={() => {
                onToggleStatus?.(task);
                onOpenChange(false);
              }}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isDone ? t("actions.markTodo") : t("actions.markDone")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
