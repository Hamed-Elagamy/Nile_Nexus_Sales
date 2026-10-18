"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Award, Zap, PhoneCall, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";

interface TickerItem {
  id: string;
  icon: "trending" | "award" | "zap" | "phone" | "sparkles";
  text_ar: string;
  text_en: string;
}

const defaultTickerItems: TickerItem[] = [
  {
    id: "1",
    icon: "trending",
    text_ar: "منصة Nile Nexus للمبيعات: نظام إدارة ومتابعة الصفقات وعروض الأسعار المعتمد",
    text_en: "Nile Nexus Sales: Enterprise CRM, Deal Pipeline & Proposal Management",
  },
  {
    id: "2",
    icon: "award",
    text_ar: "كتالوج الخدمات البرمجية: تصفح وتحديد نطاق 173 خدمة برمجية معتمدة للتسعير",
    text_en: "Services Catalog: 173 enterprise software modules ready for quoting",
  },
  {
    id: "3",
    icon: "phone",
    text_ar: "المراسلات السريعة: ربط مباشر مع WhatsApp وقوالب مراسلة احترافية موحدة",
    text_en: "Smart Outreach: Direct WhatsApp integration with standardized sales scripts",
  },
  {
    id: "4",
    icon: "zap",
    text_ar: "حاسبة التقدير والميزانية: احتساب دقيق لتكاليف المطورين وهوامش الربح",
    text_en: "Project Estimator: Accurate engineering costs & profit margin builder",
  },
  {
    id: "5",
    icon: "sparkles",
    text_ar: "أمان وسرية البيانات: حماية سحابية مشفرة لكافة بيانات العملاء والصفقات",
    text_en: "Enterprise Security: Encrypted cloud architecture for clients & deals",
  },
];

export function LiveActivityTicker() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % defaultTickerItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = defaultTickerItems[index];

  return (
    <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/15 rounded-full text-xs text-muted-foreground overflow-hidden max-w-sm 2xl:max-w-md transition-all shrink">
      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span className="shrink-0 text-primary font-semibold flex items-center gap-1">
        {current.icon === "trending" && <TrendingUp className="h-3 w-3" />}
        {current.icon === "award" && <Award className="h-3 w-3" />}
        {current.icon === "zap" && <Zap className="h-3 w-3" />}
        {current.icon === "phone" && <PhoneCall className="h-3 w-3" />}
        {current.icon === "sparkles" && <Sparkles className="h-3 w-3" />}
        <span>{isEn ? "Live:" : "مباشر:"}</span>
      </span>
      <span className="truncate text-[11px] font-medium text-foreground transition-opacity duration-300">
        {isEn ? current.text_en : current.text_ar}
      </span>
    </div>
  );
}
