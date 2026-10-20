"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Coffee,
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detectPhoneCarrier } from "@/lib/utils/phone-carrier";
import { sounds } from "@/lib/utils/confetti-sound";
import { updateCoffexLeadStatus } from "@/lib/actions/coffex";
import { toast } from "sonner";
import type { CoffexLead, CoffexLeadStatus } from "@/types/coffex";

interface CoffexLeadCardProps {
  lead: CoffexLead;
  onStatusChange?: (id: string, newStatus: CoffexLeadStatus) => void;
}

export function CoffexLeadCard({ lead, onStatusChange }: CoffexLeadCardProps) {
  const t = useTranslations("coffex");
  const locale = useLocale();
  const isEn = locale === "en";

  const [currentStatus, setCurrentStatus] = useState<CoffexLeadStatus>(lead.status);
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
    const msg = isEn
      ? `Hello Mr. ${lead.contact_name}, regarding Coffex Café Management solutions for ${lead.brand_name}... ☕`
      : `أهلاً بحضرتك يا أ. ${lead.contact_name}، معاك فريق حلول Coffex لكافيه ${lead.brand_name}... ☕`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleStatusChange = async (newStatus: CoffexLeadStatus) => {
    sounds.playTactileClick();
    setIsUpdating(true);
    setCurrentStatus(newStatus);

    const res = await updateCoffexLeadStatus({ id: lead.id, status: newStatus });
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

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-amber-500/40 transition-all shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground truncate">
                {lead.brand_name}
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono">
                {lead.business_id}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {lead.contact_name} ({t(`roles.${lead.contact_role}`)})
              </span>
            </div>
          </div>
        </div>

        {/* Interest Badge */}
        <span
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${interestConfig.color}`}
        >
          <InterestIcon className="h-3.5 w-3.5" />
          <span>{interestConfig.label}</span>
        </span>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        {/* Activity & Branches */}
        <div className="bg-muted/40 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block">
            {t("activityAndBranches")}
          </span>
          <span className="font-semibold text-foreground truncate block">
            {t(`activities.${lead.activity_type}`)}
          </span>
          <span className="text-[11px] text-primary block">
            {lead.branches_count === "1" ? t("singleBranch") : `${lead.branches_count} ${t("branchesCount")}`}
          </span>
        </div>

        {/* Current System & Budget */}
        <div className="bg-muted/40 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] text-muted-foreground block">
            {t("systemAndBudget")}
          </span>
          <span className="font-semibold text-foreground truncate block">
            {t(`systems.${lead.current_system}`)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
            {Number(lead.estimated_budget || 0).toLocaleString()} {isEn ? "EGP" : "ج.م"}
          </span>
        </div>
      </div>

      {/* Location with GPS Link */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-background p-2 rounded-lg border border-border/60">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            {lead.city} - {lead.area}
          </span>
        </div>

        {lead.gps_maps_url ? (
          <a
            href={lead.gps_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t("viewGps")}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-[10px] text-muted-foreground font-mono">
            {carrierInfo ? (isEn ? carrierInfo.name_en : carrierInfo.name_ar) : ""}
          </span>
        )}
      </div>

      {/* Interested Modules Chips */}
      {lead.interested_modules && lead.interested_modules.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {lead.interested_modules.map((mod) => (
            <span
              key={mod}
              className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-medium"
            >
              {t(`modules.${mod}`)}
            </span>
          ))}
        </div>
      )}

      {/* Notes or Next Action */}
      {lead.next_action && (
        <div className="text-xs bg-muted/20 border-s-2 border-primary ps-2.5 py-1 text-muted-foreground">
          <span className="font-semibold text-foreground">{t("nextAction")}: </span>
          <span>{lead.next_action}</span>
          {lead.next_action_date && (
            <span className="text-[10px] text-primary ms-1 block font-mono">
              📅 {new Date(lead.next_action_date).toLocaleDateString(locale)}
            </span>
          )}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
        {/* Status Dropdown */}
        <select
          value={currentStatus}
          disabled={isUpdating}
          onChange={(e) => handleStatusChange(e.target.value as CoffexLeadStatus)}
          className="text-xs font-semibold h-8 px-2 rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
        >
          <option value="NEW">{t("statuses.NEW")}</option>
          <option value="CONTACTED">{t("statuses.CONTACTED")}</option>
          <option value="DEMO_SCHEDULED">{t("statuses.DEMO_SCHEDULED")}</option>
          <option value="PROPOSAL_SENT">{t("statuses.PROPOSAL_SENT")}</option>
          <option value="WON">{t("statuses.WON")}</option>
          <option value="LOST">{t("statuses.LOST")}</option>
        </select>

        {/* Contact Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLaunchWhatsApp}
            className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">واتساب</span>
          </Button>

          <a
            href={`tel:${lead.phone}`}
            onClick={() => sounds.playTactileClick()}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded-md border border-border text-xs text-foreground hover:bg-muted font-medium transition-colors gap-1"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{t("call")}</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
