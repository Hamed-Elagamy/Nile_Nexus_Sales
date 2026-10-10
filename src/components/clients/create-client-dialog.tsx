"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle, Building2, User } from "lucide-react";
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
import { createClient } from "@/lib/actions/clients";
import type { ClientType } from "@/lib/schemas/client";

interface CreateClientDialogProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreateClientDialog({ onSuccess, triggerButton }: CreateClientDialogProps) {
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [type, setType] = useState<ClientType>("COMPANY");
  const [area, setArea] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Primary Contact fields
  const [contactName, setContactName] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setType("COMPANY");
    setArea("");
    setIndustry("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setAddress("");
    setNotes("");
    setContactName("");
    setContactJobTitle("");
    setContactPhone("");
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(t("nameRequired"));
      return;
    }

    startTransition(async () => {
      const res = await createClient({
        name: name.trim(),
        type,
        area: area.trim() || undefined,
        industry: industry.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        primary_contact: contactName.trim()
          ? {
              name: contactName.trim(),
              job_title: contactJobTitle.trim() || undefined,
              phone: contactPhone.trim() || undefined,
            }
          : undefined,
      });

      if (!res.success) {
        setFormError(res.error || tCommon("error"));
        toast.error(res.error || tCommon("error"));
        return;
      }

      toast.success(t("createSuccess"));
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
              <span>{t("addNew")}</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{t("createDialogTitle")}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Client Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("clientTypeLabel")}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("COMPANY")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  type === "COMPANY"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{t("companyOption")}</span>
              </button>
              <button
                type="button"
                onClick={() => setType("INDIVIDUAL")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  type === "INDIVIDUAL"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                <User className="h-4 w-4" />
                <span>{t("individualOption")}</span>
              </button>
            </div>
          </div>

          {/* Name & Industry/Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("nameCompanyLabel")} <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder={type === "COMPANY" ? t("nameCompanyPlaceholder") : t("nameIndividualPlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {type === "COMPANY" ? t("industryCompanyLabel") : t("industryIndividualLabel")}
              </label>
              <Input
                placeholder={t("industryPlaceholder")}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("phoneLabel")}</label>
              <Input
                placeholder="010XXXXXXXX"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("emailLabel")}</label>
              <Input
                type="email"
                placeholder="info@company.com"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Area & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("areaLabel")}</label>
              <Input
                placeholder={t("areaPlaceholder")}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t("websiteLabel")}</label>
              <Input
                placeholder="https://company.com"
                dir="ltr"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Primary Contact Section */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-3">
            <span className="text-xs font-bold text-foreground block">
              {t("primaryContactSection")}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder={t("contactNamePlaceholder")}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="bg-card text-xs"
              />
              <Input
                placeholder={t("contactJobTitlePlaceholder")}
                value={contactJobTitle}
                onChange={(e) => setContactJobTitle(e.target.value)}
                className="bg-card text-xs"
              />
              <Input
                placeholder={t("contactPhonePlaceholder")}
                dir="ltr"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="bg-card text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("generalNotesLabel")}</label>
            <Textarea
              placeholder={t("notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
