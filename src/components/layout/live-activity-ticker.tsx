"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Award, Zap, PhoneCall, Sparkles } from "lucide-react";

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
    text_ar: "مبيعات Nile Nexus: تم تسجيل وتحديث 24 متابعة تجارية هذا الأسبوع",
    text_en: "Nile Nexus Sales: 24 active commercial follow-ups logged this week",
  },
  {
    id: "2",
    icon: "award",
    text_ar: "إنجاز جديد: اعتماد صفقة نظام ERP متكامل للمقاولات بقيمة 180,000 ج.م",
    text_en: "New Milestone: Closed Contracting ERP Deal for 180,000 EGP",
  },
  {
    id: "3",
    icon: "zap",
    text_ar: "كتالوج الخدمات: 173 مشروعاً برمجياً جاهزاً للتسعير الفوري وبناء عروض الأسعار",
    text_en: "Services Catalog: 173 software project MVPs ready for instant quoting",
  },
  {
    id: "4",
    icon: "phone",
    text_ar: "متابعات اليوم: استجابة سريعة للعملاء المحتملين خلال أقل من 15 دقيقة",
    text_en: "Today's Outreach: Potential leads responded to in under 15 minutes",
  },
  {
    id: "5",
    icon: "sparkles",
    text_ar: "فريق المبيعات: تم تحقيق 78% من المستهدف الربع سنوي حتى الآن",
    text_en: "Sales Team: 78% of Quarterly Pipeline Target achieved to date",
  },
];

export function LiveActivityTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % defaultTickerItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = defaultTickerItems[index];

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/15 rounded-full text-xs text-muted-foreground overflow-hidden max-w-md transition-all">
      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span className="shrink-0 text-primary font-semibold flex items-center gap-1">
        {current.icon === "trending" && <TrendingUp className="h-3 w-3" />}
        {current.icon === "award" && <Award className="h-3 w-3" />}
        {current.icon === "zap" && <Zap className="h-3 w-3" />}
        {current.icon === "phone" && <PhoneCall className="h-3 w-3" />}
        {current.icon === "sparkles" && <Sparkles className="h-3 w-3" />}
        <span>مباشر:</span>
      </span>
      <span className="truncate text-[11px] font-medium text-foreground transition-opacity duration-300">
        {current.text_ar}
      </span>
    </div>
  );
}
