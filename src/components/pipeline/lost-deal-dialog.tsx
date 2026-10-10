"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updateDealStage } from "@/lib/actions/deals";

interface LostDealDialogProps {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LostDealDialog({
  dealId,
  open,
  onOpenChange,
  onSuccess,
}: LostDealDialogProps) {
  const tDeals = useTranslations("deals.lostDialog");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState("");
  const [resurfaceDate, setResurfaceDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId) return;

    setError(null);
    startTransition(async () => {
      const res = await updateDealStage({
        deal_id: dealId,
        stage: "LOST",
        lost_notes: notes.trim() || undefined,
        resurface_date: resurfaceDate || undefined,
      });

      if (!res.success) {
        setError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      toast.info(tDeals("successToast"));
      onOpenChange(false);
      setNotes("");
      setResurfaceDate("");
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
            <span>{tDeals("title")}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDeals("notesLabel")}
            </label>
            <Textarea
              placeholder={tDeals("notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDeals("resurfaceDateLabel")}
            </label>
            <Input
              type="date"
              value={resurfaceDate}
              onChange={(e) => setResurfaceDate(e.target.value)}
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              {tDeals("resurfaceDateHint")}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{tDeals("confirmButton")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
