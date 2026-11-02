"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ShoppingBag,
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  Calendar,
  Flame,
  Zap,
  Clock,
  Building2,
  User,
  CheckCircle2,
  Layers,
  Coins,
  ChevronDown,
  Globe,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detectPhoneCarrier } from "@/lib/utils/phone-carrier";
import { sounds } from "@/lib/utils/confetti-sound";
import { updateNexaLeadStatus } from "@/lib/actions/nexa";
import { toast } from "sonner";
import type { NexaLead, NexaLeadStatus } from "@/types/nexa";

interface NexaLeadCardProps {
  lead: NexaLead;
  onStatusChange?: (id: string, newStatus: NexaLeadStatus) => void;
}

export function NexaLeadCard({ lead, onStatusChange }: NexaLeadCardProps) {
  const t = useTranslations("nexa");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEn = locale === "en";

  const [currentStatus, setCurrentStatus] = useState<NexaLeadStatus>(lead.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const carrierInfo = detectPhoneCarrier(lead.phone);

  const cleanPhone = React.useMemo(() => {
    let p = lead.phone.replace(/[^0-9]/g, "");
    if (p.startsWith("01") && p.length === 11) {
      p = "2" + p;
    }
    return p;
  }, [lead.phone]);

  const handleLaunchWhatsApp = () => {
    sounds.playTactileClick();
    const msg = t("whatsAppCardMessage", {
      contact: lead.contact_name,
      brand: lead.brand_name,
    });
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleStatusChange = async (newStatus: NexaLeadStatus) => {
    sounds.playTactileClick();
    setIsUpdating(true);
    setCurrentStatus(newStatus);

    const res = await updateNexaLeadStatus({ id: lead.id, status: newStatus });
    setIsUpdating(false);

    if (res.success) {
      toast.success(t("statusUpdated"));
      if (onStatusChange) onStatusChange(lead.id, newStatus);
    } else {
      setCurrentStatus(lead.status);
      toast.error(res.error || t("statusUpdateFailed"));
    }
  };

  const interestConfig = {
    HOT: {
      color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
      icon: Flame,
      label: t("interest.HOT"),
    },
    WARM: {
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      icon: Zap,
      label: t("interest.WARM"),
    },
    COLD: {
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      icon: Clock,
      label: t("interest.COLD"),
    },
  }[lead.interest_level];

  const InterestIcon = interestConfig.icon;

  const statusColors: Record<NexaLeadStatus, string> = {
    NEW: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    CONTACTED: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    DEMO_SCHEDULED: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    PROPOSAL_SENT: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
    WON: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold",
    LOST: "bg-gray-500/10 text-gray-500 border-gray-500/30",
  };

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border border-border/80 hover:border-primary/50 transition-all bg-card/60 backdrop-blur-sm shadow-sm space-y-4">
      {/* Top Header: Brand Name + ID + Interest Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-foreground truncate">
                {lead.brand_name}
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-2 py-0 border-border bg-muted/40 shrink-0"
              >
                {lead.business_id}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium text-foreground/80">
                <User className="h-3 w-3 text-muted-foreground" />
                {lead.contact_name}
              </span>
              <span>•</span>
              <span className="text-[11px] bg-muted/60 px-1.5 py-0.5 rounded">
                {t(`roles.${lead.contact_role}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Interest Badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${interestConfig.color}`}
        >
          <InterestIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{interestConfig.label}</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
        {/* Phone & Carrier */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">{t("phone")}:</span>
          <div className="flex items-center gap-1.5 font-mono font-medium text-foreground" dir="ltr">
            {lead.phone}
            {carrierInfo && (
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 border ${carrierInfo.badgeColor}`}
              >
                {carrierInfo.name_ar}
              </Badge>
            )}
          </div>
        </div>

        {/* Location & GPS Link */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">{t("area")}:</span>
          <div className="flex items-center gap-1 font-medium text-foreground truncate max-w-[60%]">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{lead.area}, {lead.city}</span>
            {lead.gps_maps_url && (
              <a
                href={lead.gps_maps_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline ms-1 shrink-0"
                title={t("viewGps")}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Vertical & Commerce Model */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">{t("activityAndBranches")}:</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>{t(`verticals.${lead.vertical_type}`)}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-semibold">
              {lead.branches_count} {t("branchesCount")}
            </span>
          </div>
        </div>

        {/* Current System & Plan Interest */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">{t("systemAndBudget")}:</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="text-muted-foreground text-[11px]">
              {t(`systems.${lead.current_system}`)}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {t(`plans.${lead.plan_interest}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Website or Social Page link if provided */}
      {lead.store_url && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground p-2 rounded-xl bg-muted/20 border border-border/30">
          <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-mono truncate text-primary hover:underline">
            <a href={lead.store_url.startsWith("http") ? lead.store_url : `https://${lead.store_url}`} target="_blank" rel="noreferrer">
              {lead.store_url}
            </a>
          </span>
        </div>
      )}

      {/* Next Action & Date Banner */}
      {lead.next_action && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 min-w-0">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span className="font-medium truncate">{lead.next_action}</span>
          </div>
          {lead.next_action_date && (
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300 shrink-0 font-semibold ms-2">
              {new Date(lead.next_action_date).toLocaleDateString(locale)}
            </span>
          )}
        </div>
      )}

      {/* Notes preview if available */}
      {lead.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2 italic px-1">
          &quot;{lead.notes}&quot;
        </p>
      )}

      {/* Footer Actions: WhatsApp, Call, Status Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5">
          <select
            value={currentStatus}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as NexaLeadStatus)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors ${statusColors[currentStatus]}`}
          >
            <option value="NEW">{t("statuses.NEW")}</option>
            <option value="CONTACTED">{t("statuses.CONTACTED")}</option>
            <option value="DEMO_SCHEDULED">{t("statuses.DEMO_SCHEDULED")}</option>
            <option value="PROPOSAL_SENT">{t("statuses.PROPOSAL_SENT")}</option>
            <option value="WON">{t("statuses.WON")}</option>
            <option value="LOST">{t("statuses.LOST")}</option>
          </select>
        </div>

        {/* Fast Outreach Buttons */}
        <div className="flex items-center gap-1.5 ms-auto">
          {/* Direct Phone Call */}
          <a
            href={`tel:${lead.phone}`}
            onClick={() => sounds.playTactileClick()}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded-md border border-border hover:bg-muted text-xs text-foreground font-medium transition-colors gap-1.5"
          >
            <Phone className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline">{t("call")}</span>
          </a>

          {/* Direct WhatsApp Outreach */}
          <Button
            type="button"
            size="sm"
            onClick={handleLaunchWhatsApp}
            className="h-8 px-2.5 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{tCommon("whatsapp")}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
