"use client";

import React, { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Building,
  Briefcase,
  User,
  MoreVertical,
  Edit2,
  Trash2,
  PlayCircle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithRelations } from "@/types/task";
import type { TaskStatus } from "@/types/domain";

interface TaskCardProps {
  task: TaskWithRelations;
  onEdit: (task: TaskWithRelations) => void;
  onViewDetails: (task: TaskWithRelations) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onViewDetails,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const isDone = task.status === "DONE";
  const isInProgress = task.status === "IN_PROGRESS";
  const isUrgent = task.priority === "URGENT";
  const isImportant = task.priority === "IMPORTANT";

  // Check if overdue
  const isOverdue =
    task.deadline &&
    !isDone &&
    task.status !== "CANCELLED" &&
    new Date(task.deadline).getTime() < Date.now();

  const handleToggleDone = () => {
    startTransition(() => {
      const nextStatus: TaskStatus = isDone ? "TODO" : "DONE";
      onStatusChange(task.id, nextStatus);
    });
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDone
          ? "bg-card/50 border-border/60 opacity-80"
          : isOverdue
          ? "bg-red-50/20 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 hover:border-red-300"
          : "bg-card border-border hover:border-primary/40 shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={handleToggleDone}
          disabled={isPending}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          title={isDone ? t("actions.markTodo") : t("actions.markDone")}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
          ) : isInProgress ? (
            <PlayCircle className="h-5 w-5 text-blue-500 fill-blue-500/20" />
          ) : (
            <Circle className="h-5 w-5 hover:stroke-primary" />
          )}
        </button>

        {/* Task Content */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onViewDetails(task)}
              className={`font-semibold text-base cursor-pointer hover:text-primary transition-colors ${
                isDone
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Badge */}
            <Badge
              variant={
                isUrgent ? "destructive" : isImportant ? "default" : "secondary"
              }
              className="text-[11px] py-0 px-2 h-5"
            >
              {t(`priority.${task.priority}`)}
            </Badge>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={`text-[11px] py-0 px-2 h-5 ${
                isDone
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : isInProgress
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : task.status === "CANCELLED"
                  ? "bg-muted text-muted-foreground line-through"
                  : "bg-card text-foreground"
              }`}
            >
              {t(`status.${task.status}`)}
            </Badge>

            {/* Overdue Alert Badge */}
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-5 flex items-center gap-1 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span>متأخرة</span>
              </Badge>
            )}
          </div>

          {/* Notes snippet */}
          {task.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.notes}
            </p>
          )}

          {/* Metadata chips */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
            {/* Assignee */}
            {task.assignee && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <User className="h-3 w-3" />
                <span>{task.assignee.full_name}</span>
              </span>
            )}

            {/* Due Date */}
            {task.deadline && (
              <span
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  isOverdue ? "text-red-600 dark:text-red-400 font-bold" : ""
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>{new Date(task.deadline).toISOString().split("T")[0]}</span>
              </span>
            )}

            {/* Client */}
            {task.client && (
              <span className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                <Building className="h-3 w-3" />
                <span>{task.client.name}</span>
              </span>
            )}

            {/* Deal */}
            {task.deal && (
              <span className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                <Briefcase className="h-3 w-3" />
                <span>{task.deal.title}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(task)}
          className="text-xs h-8 gap-1"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{t("actions.details")}</span>
        </Button>

        {/* Fast Action / Toggle */}
        {!isDone ? (
          <Button
            size="sm"
            onClick={handleToggleDone}
            disabled={isPending}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("actions.markDone")}</span>
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleDone}
            disabled={isPending}
            className="text-xs h-8 gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{t("actions.markTodo")}</span>
          </Button>
        )}

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="gap-2 cursor-pointer text-xs"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{t("actions.edit")}</span>
            </DropdownMenuItem>

            {!isInProgress && !isDone && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                className="gap-2 cursor-pointer text-xs text-blue-600"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>{t("actions.markInProgress")}</span>
              </DropdownMenuItem>
            )}

            {!isDone ? (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "DONE")}
                className="gap-2 cursor-pointer text-xs text-emerald-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t("actions.markDone")}</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "TODO")}
                className="gap-2 cursor-pointer text-xs"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{t("actions.markTodo")}</span>
              </DropdownMenuItem>
            )}

            {task.status !== "CANCELLED" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "CANCELLED")}
                className="gap-2 cursor-pointer text-xs text-muted-foreground"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{t("actions.cancel")}</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
