"use client";

import React, { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [newDueAt, setNewDueAt] = useState("");
  const [reason, setReason] = useState("");

  if (!followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueAt) {
      toast.error("يرجى تحديد الموعد الجديد");
      return;
    }

    startTransition(async () => {
      const res = await rescheduleFollowUp({
        follow_up_id: followUp.id,
        new_due_at: new Date(newDueAt).toISOString(),
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        toast.success("تم تأجيل موعد المتابعة بنجاح! ⏱️");
        onOpenChange(false);
        setNewDueAt("");
        setReason("");
        onSuccess?.();
      } else {
        toast.error(res.error || "فشل تأجيل المتابعة");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>تأجيل موعد المتابعة</span>
          </DialogTitle>
          <DialogDescription>
            {followUp.client ? `العميل: ${followUp.client.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              الموعد الجديد <span className="text-destructive">*</span>
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
            <label className="text-xs font-semibold text-foreground">سبب التأجيل (اختياري)</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: العميل طلب التواصل بعد الساعة 5"
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
              إلغاء
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "جارٍ الحفظ..." : "حفظ الموعد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
