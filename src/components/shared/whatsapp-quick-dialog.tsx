"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MessageSquare, Send, Copy, Check, Sparkles, Phone, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface WhatsAppQuickDialogProps {
  phone: string;
  recipientName: string;
  contextType?: "lead" | "client" | "deal" | "follow_up";
  trigger?: React.ReactNode;
  className?: string;
}

export function WhatsAppQuickDialog({
  phone,
  recipientName,
  contextType = "client",
  trigger,
  className,
}: WhatsAppQuickDialogProps) {
  const t = useTranslations("whatsapp");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clean phone number for WhatsApp wa.me
  const rawDigits = phone.replace(/\D/g, "");
  const cleanPhone = rawDigits.startsWith("0") ? "2" + rawDigits : rawDigits;

  const templates = [
    {
      id: "intro",
      label: t("templateIntroLabel"),
      text: t("templateIntroText", { name: recipientName }),
    },
    {
      id: "proposal",
      label: t("templateProposalLabel"),
      text: t("templateProposalText", { name: recipientName }),
    },
    {
      id: "meeting",
      label: t("templateMeetingLabel"),
      text: t("templateMeetingText", { name: recipientName }),
    },
    {
      id: "reminder",
      label: t("templateReminderLabel"),
      text: t("templateReminderText", { name: recipientName }),
    },
    {
      id: "congrats",
      label: t("templateCongratsLabel"),
      text: t("templateCongratsText", { name: recipientName }),
    },
  ];

  // Default active template based on context
  const initialTemplate =
    contextType === "lead"
      ? templates[0]
      : contextType === "follow_up"
      ? templates[3]
      : templates[1];

  const [activeTemplateId, setActiveTemplateId] = useState<string>(initialTemplate.id);
  const [messageText, setMessageText] = useState<string>(initialTemplate.text);

  const handleSelectTemplate = (template: typeof templates[0]) => {
    setActiveTemplateId(template.id);
    setMessageText(template.text);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success(t("copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  const handleOpenWhatsApp = () => {
    if (!cleanPhone) {
      toast.error(t("invalidPhone"));
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  if (!phone) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <button
              type="button"
              className={
                className ||
                "p-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/30 transition-colors inline-flex items-center justify-center"
              }
              title={t("triggerTitle")}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-4 w-4" />
              </span>
              <span>{t("dialogTitle")}</span>
            </DialogTitle>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <User className="h-3 w-3 text-muted-foreground" />
              {recipientName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono direction-ltr text-[11px]">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {phone}
            </span>
          </div>
        </DialogHeader>

        {/* Template Selector Pills */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t("selectTemplateLabel")}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((tpl) => {
              const isSelected = activeTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              {t("messageTextLabel")}
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {messageText.length} {t("charCount")}
            </span>
          </div>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={5}
            className="text-xs resize-none leading-relaxed bg-card"
            placeholder={t("messagePlaceholder")}
          />
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs h-8 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("copiedBtn")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{t("copyBtn")}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenWhatsApp}
            className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t("sendWhatsAppBtn")}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
