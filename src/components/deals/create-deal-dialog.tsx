"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDeal } from "@/lib/actions/deals";
import { DEAL_STAGES, type DealStage } from "@/lib/schemas/deal";

interface CreateDealDialogProps {
  clients?: Array<{ id: string; name: string; business_id: string }>;
  defaultClientId?: string;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreateDealDialog({
  clients = [],
  defaultClientId,
  onSuccess,
  triggerButton,
}: CreateDealDialogProps) {
  const tDeals = useTranslations("deals");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [stage, setStage] = useState<DealStage>("NEW");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setClientId(defaultClientId || "");
    setStage("NEW");
    setEstimatedValue("");
    setCurrency("EGP");
    setNotes("");
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError(tDeals("titleRequired"));
      return;
    }

    if (!clientId) {
      setFormError(tDeals("clientRequired"));
      return;
    }

    startTransition(async () => {
      const res = await createDeal({
        title: title.trim(),
        client_id: clientId,
        stage,
        estimated_value: estimatedValue ? Number(estimatedValue) : undefined,
        currency,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      toast.success(tDeals("createSuccess"));
      setOpen(false);
      resetForm();
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          triggerButton ? (
            (triggerButton as React.ReactElement)
          ) : (
            <Button className="gap-2 bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-95">
              <Plus className="h-4 w-4" />
              <span>{tDeals("addNew")}</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{tDeals("createDialogTitle")}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDeals("dealTitleLabel")} <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder={tDeals("dealTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Client Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {tDeals("clientLabel")} <span className="text-destructive">*</span>
            </label>
            {clients.length > 0 ? (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">{tDeals("selectClientOption")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.business_id})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                placeholder={tDeals("clientIdPlaceholder")}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
            )}
          </div>

          {/* Stage & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{tDeals("startingStageLabel")}</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {tDeals(`stages.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{tDeals("expectedValueLabel")}</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-10 px-2 rounded-lg border border-border bg-card text-foreground text-xs"
                >
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{tDeals("dealNotesLabel")}</label>
            <Textarea
              placeholder={tDeals("dealNotesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{tCommon("save")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
