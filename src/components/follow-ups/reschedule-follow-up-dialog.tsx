"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rescheduleFollowUp, type FollowUpWithRelations } from "@/lib/actions/follow-ups";

interface RescheduleFollowUpDialogProps {
  followUp: FollowUpWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RescheduleFollowUpDialog({
  followUp,
  open,
  onOpenChange,
  onSuccess,
}: RescheduleFollowUpDialogProps) {
  const tDialog = useTranslations("followUps.rescheduleDialog");
  const tComplete = useTranslations("followUps.completeDialog");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [newDueAt, setNewDueAt] = useState("");
  const [reason, setReason] = useState("");

  if (!followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueAt) {
      toast.error(tDialog("newDateRequired"));
      return;
    }

    startTransition(async () => {
      const res = await rescheduleFollowUp({
        follow_up_id: followUp.id,
        new_due_at: new Date(newDueAt).toISOString(),
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        toast.success(tDialog("successToast"));
        onOpenChange(false);
        setNewDueAt("");
        setReason("");
        onSuccess?.();
      } else {
        toast.error(res.error || tDialog("failedToast"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>{tDialog("title")}</span>
          </DialogTitle>
          <DialogDescription>
            {followUp.client ? tComplete("clientPrefix", { name: followUp.client.name }) : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDialog("newDateLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="datetime-local"
              value={newDueAt}
              onChange={(e) => setNewDueAt(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{tDialog("reasonLabel")}</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={tDialog("reasonPlaceholder")}
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? tCommon("loading") : tDialog("saveButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
