"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { completeFollowUp, type FollowUpWithRelations } from "@/lib/actions/follow-ups";

interface CompleteFollowUpDialogProps {
  followUp: FollowUpWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompleteFollowUpDialog({
  followUp,
  open,
  onOpenChange,
  onSuccess,
}: CompleteFollowUpDialogProps) {
  const tDialog = useTranslations("followUps.completeDialog");
  const tActions = useTranslations("followUps.actions");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [result, setResult] = useState("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextAction, setNextAction] = useState("CALL");
  const [nextDueAt, setNextDueAt] = useState("");
  const [nextNotes, setNextNotes] = useState("");

  if (!followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.trim()) {
      toast.error(tDialog("resultRequired"));
      return;
    }

    if (scheduleNext && !nextDueAt) {
      toast.error(tDialog("nextDueRequired"));
      return;
    }

    startTransition(async () => {
      const res = await completeFollowUp({
        follow_up_id: followUp.id,
        completion_result: result.trim(),
        schedule_next: scheduleNext,
        next_action: scheduleNext ? nextAction : undefined,
        next_due_at: scheduleNext && nextDueAt ? new Date(nextDueAt).toISOString() : undefined,
        next_notes: scheduleNext && nextNotes.trim() ? nextNotes.trim() : undefined,
      });

      if (res.success) {
        toast.success(tDialog("successToast"));
        onOpenChange(false);
        setResult("");
        setScheduleNext(false);
        setNextDueAt("");
        setNextNotes("");
        onSuccess?.();
      } else {
        toast.error(res.error || tDialog("failedToast"));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{tDialog("title")}</span>
          </DialogTitle>
          <DialogDescription>
            {followUp.client ? tDialog("clientPrefix", { name: followUp.client.name }) : tDialog("detailsFallback")}
            {followUp.deal ? tDialog("dealPrefix", { title: followUp.deal.title }) : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Completion Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDialog("whatHappenedLabel")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder={tDialog("whatHappenedPlaceholder")}
              rows={3}
              required
              className="resize-none text-sm"
            />
          </div>

          {/* Schedule Next Checkbox */}
          <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm font-medium text-foreground">
                {tDialog("scheduleNextLabel")}
              </span>
            </label>

            {scheduleNext && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{tDialog("nextActionLabel")}</label>
                    <select
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="CALL">{tActions("CALL")}</option>
                      <option value="MEETING">{tActions("MEETING")}</option>
                      <option value="WHATSAPP">{tActions("WHATSAPP")}</option>
                      <option value="EMAIL">{tActions("EMAIL")}</option>
                      <option value="VISIT">{tActions("VISIT")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {tDialog("nextDueAtLabel")} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={nextDueAt}
                      onChange={(e) => setNextDueAt(e.target.value)}
                      required={scheduleNext}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{tDialog("nextNotesLabel")}</label>
                  <Input
                    value={nextNotes}
                    onChange={(e) => setNextNotes(e.target.value)}
                    placeholder={tDialog("nextNotesPlaceholder")}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}
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
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? tCommon("loading") : tDialog("saveButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
