"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Edit3, AlertCircle, User, Clock, Building, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/lib/actions/tasks";
import type { TaskFormData, TaskWithRelations } from "@/types/task";
import type { TaskPriority, TaskStatus } from "@/types/domain";

interface EditTaskDialogProps {
  task: TaskWithRelations | null;
  formData: TaskFormData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: TaskWithRelations) => void;
}

export function EditTaskDialog({
  task,
  formData,
  open,
  onOpenChange,
  onSuccess,
}: EditTaskDialogProps) {
  const t = useTranslations("tasks");
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState("");
  const [dealId, setDealId] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setNotes(task.notes || "");
      setPriority(task.priority || "NORMAL");
      setStatus(task.status || "TODO");
      setAssigneeId(task.assignee_id || "");
      setDeadline(
        task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
      );
      setClientId(task.client_id || "");
      setDealId(task.deal_id || "");
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t("dialog.taskTitlePlaceholder"));
      return;
    }

    startTransition(async () => {
      const res = await updateTask({
        id: task.id,
        title: title.trim(),
        notes: notes.trim() || null,
        priority,
        status,
        assignee_id: assigneeId || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        client_id: clientId || null,
        deal_id: dealId || null,
      });

      if (res.success && res.data) {
        toast.success(t("messages.updateSuccess"));
        onOpenChange(false);
        onSuccess?.(res.data);
      } else {
        toast.error(res.error || t("messages.error"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Edit3 className="h-5 w-5 text-primary" />
            <span>{t("dialog.editTitle")}</span>
          </DialogTitle>
          <DialogDescription>
            {task.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("dialog.taskTitle")} <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("dialog.taskTitlePlaceholder")}
              required
              disabled={isPending}
              className="text-sm"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
                <span>{t("dialog.priority")}</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="NORMAL">{t("priority.NORMAL")}</option>
                <option value="IMPORTANT">{t("priority.IMPORTANT")}</option>
                <option value="URGENT">{t("priority.URGENT")}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("dialog.status")}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="TODO">{t("status.TODO")}</option>
                <option value="IN_PROGRESS">{t("status.IN_PROGRESS")}</option>
                <option value="DONE">{t("status.DONE")}</option>
                <option value="CANCELLED">{t("status.CANCELLED")}</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{t("dialog.assignee")}</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="">{t("dialog.assigneePlaceholder")}</option>
                {formData.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{t("dialog.dueDate")}</span>
              </label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isPending}
                className="text-xs"
              />
            </div>
          </div>

          {/* Client & Deal (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("dialog.client")}</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="">{t("dialog.clientPlaceholder")}</option>
                {formData.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("dialog.deal")}</span>
              </label>
              <select
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                disabled={isPending}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="">{t("dialog.dealPlaceholder")}</option>
                {formData.deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("dialog.notes")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("dialog.notesPlaceholder")}
              rows={3}
              disabled={isPending}
              className="text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? t("dialog.saving") : t("dialog.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
