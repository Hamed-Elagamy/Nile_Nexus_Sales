"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, CheckSquare, Clock, AlertCircle, User, Building, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/actions/tasks";
import type { TaskFormData, TaskWithRelations } from "@/types/task";
import type { TaskPriority } from "@/types/domain";

interface CreateTaskDialogProps {
  formData: TaskFormData;
  triggerButton?: React.ReactNode;
  prefilledClientId?: string;
  prefilledDealId?: string;
  onSuccess?: (created: TaskWithRelations) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTaskDialog({
  formData,
  triggerButton,
  prefilledClientId,
  prefilledDealId,
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateTaskDialogProps) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [assigneeId, setAssigneeId] = useState(formData.currentUserId || (formData.profiles[0]?.id ?? ""));
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState(prefilledClientId || "");
  const [dealId, setDealId] = useState(prefilledDealId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t("dialog.taskTitlePlaceholder"));
      return;
    }

    if (!assigneeId) {
      toast.error(t("dialog.assigneePlaceholder"));
      return;
    }

    startTransition(async () => {
      const res = await createTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        assignee_id: assigneeId,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        client_id: (prefilledClientId || clientId) || undefined,
        deal_id: (prefilledDealId || dealId) || undefined,
      });

      if (res.success && res.data) {
        toast.success(t("messages.createSuccess"));
        setOpen(false);
        setTitle("");
        setNotes("");
        setDeadline("");
        setPriority("NORMAL");
        onSuccess?.(res.data);
      } else {
        toast.error(res.error || t("messages.error"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton ? (
        <DialogTrigger render={triggerButton as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t("addNew")}</span>
            </Button>
          }
        />
      )}

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>{t("dialog.createTitle")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("dialog.createSubtitle")}
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

          {/* Priority & Assignee */}
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
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{t("dialog.assignee")}</span> <span className="text-destructive">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
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
          </div>

          {/* Due Date */}
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
                disabled={isPending || !!prefilledClientId}
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
                disabled={isPending || !!prefilledDealId}
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
              onClick={() => setOpen(false)}
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
