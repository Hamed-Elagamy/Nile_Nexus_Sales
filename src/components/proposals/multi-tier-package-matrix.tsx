"use client";

import React, { useState } from "react";
import { Check, Star, Zap, Shield, Sparkles, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface TierPackage {
  id: "mvp" | "recommended" | "enterprise";
  title_ar: string;
  title_en: string;
  tagline_ar: string;
  tagline_en: string;
  priceEgp: number;
  deliveryWeeks: number;
  isPopular?: boolean;
  features_ar: string[];
  features_en: string[];
  support_ar: string;
  support_en: string;
}

interface MultiTierPackageMatrixProps {
  basePrice?: number;
  currency?: string;
  isClientView?: boolean;
  selectedTier?: "mvp" | "recommended" | "enterprise";
  onSelectTier?: (tier: "mvp" | "recommended" | "enterprise") => void;
}

export function MultiTierPackageMatrix({
  basePrice = 120000,
  currency = "EGP",
  isClientView = false,
  selectedTier: externalSelectedTier,
  onSelectTier,
}: MultiTierPackageMatrixProps) {
  const locale = useLocale();
  const isEn = locale === "en";
  const [internalSelected, setInternalSelected] = useState<"mvp" | "recommended" | "enterprise">("recommended");

  const activeTier = externalSelectedTier || internalSelected;

  const handleSelect = (tier: "mvp" | "recommended" | "enterprise") => {
    setInternalSelected(tier);
    onSelectTier?.(tier);
  };

  const tiers: TierPackage[] = [
    {
      id: "mvp",
      title_ar: "باقة الأساسيات (MVP)",
      title_en: "Starter MVP Tier",
      tagline_ar: "إطلاق سريع للميزات الجوهرية بأقل تكلفة وزمن قياسي",
      tagline_en: "Quick launch for core essential features with lean investment",
      priceEgp: Math.round(basePrice * 0.7),
      deliveryWeeks: 4,
      features_ar: [
        "بناء الواجهات الأساسية وتجربة مستخدم Responsive",
        "لوحة تحكم إدارية مصغرة لإدارة البيانات",
        "قاعدة بيانات سحابية وتوثيق دخول المستخدمين",
        "استضافة وإعداد خادم الإنتاج السحابي",
        "دعم فني وصيانة مجانية لمدة 30 يوماً بعد الإطلاق",
      ],
      features_en: [
        "Core responsive user interface & flow",
        "Mini admin dashboard for record management",
        "Cloud database & secure authentication",
        "Production server provisioning & deployment",
        "30 days warranty & bug fixing support",
      ],
      support_ar: "دعم فني عبر البريد (خلال 24 ساعة عمل)",
      support_en: "Email ticketing support (24h turnaround)",
    },
    {
      id: "recommended",
      title_ar: "باقة النمو الاحترافية (Professional)",
      title_en: "Growth Pro Tier",
      tagline_ar: "الحل المتكامل الشامل الموصى به لتحقيق أعلى عائد استثماري",
      tagline_en: "Comprehensive recommended stack for scalability and max ROI",
      priceEgp: basePrice,
      deliveryWeeks: 8,
      isPopular: true,
      features_ar: [
        "جميع مزايا باقة الأساسيات بالكامل",
        "نظام إشعارات وتنبيهات فورية (Push + Email)",
        "ربط بوابات الدفع الإلكتروني وفواتير المعاملات",
        "لوحة تقارير تحليلية ومؤشرات أداء KPI حية",
        "تكامل مع WhatsApp API وخدمات الطرف الثالث",
        "ضمان وصيانة ودعم فني مخصص لمدة 90 يوماً",
      ],
      features_en: [
        "Everything in the Starter tier",
        "Real-time push and email notifications",
        "Payment gateway integration & invoicing",
        "Live KPI business intelligence dashboards",
        "WhatsApp Business API integration",
        "90 days priority warranty & SLA support",
      ],
      support_ar: "دعم فني مخصص ومباشر عبر واتساب (خلال ساعتين)",
      support_en: "Priority direct WhatsApp channel (2h SLA)",
    },
    {
      id: "enterprise",
      title_ar: "باقة المؤسسات والريادة (Enterprise)",
      title_en: "Enterprise Scale Tier",
      tagline_ar: "بنية تحتية متقدمة وقابلية توسع للمؤسسات الكبرى",
      tagline_en: "Enterprise-grade high availability, security & bespoke automation",
      priceEgp: Math.round(basePrice * 1.55),
      deliveryWeeks: 14,
      features_ar: [
        "جميع مزايا الباقة الاحترافية بالكامل",
        "بنية تحتية High Availability تتحمل ملايين الزيارات",
        "تكامل مخصص مع أنظمة ERP الحالية (SAP, Odoo, Oracle)",
        "اختبارات أمنية واختبارات ضغط متقدمة (Penetration Testing)",
        "تطبيق موبايل مخصص (iOS & Android) مع نشر المتاجر",
        "دعم فني وضمان ذهبي لمدة سنة كاملة (24/7 SLA)",
      ],
      features_en: [
        "Everything in the Professional tier",
        "High availability infrastructure & load balancing",
        "Custom integration with enterprise ERPs (SAP/Odoo)",
        "Enterprise penetration testing & security hardening",
        "Native mobile apps for iOS & Android + store publishing",
        "1 full year 24/7 dedicated support & SLA",
      ],
      support_ar: "مدير حساب تقني مخصص ودعم 24/7 طوال العام",
      support_en: "Dedicated Tech Account Manager & 24/7 hotline",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isEn ? "Available Project Execution Packages" : "خيارات وباقات تنفيذ المشروع المتاحة"}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {isEn ? "Select the Package Matching Your Growth & Budget" : "اختر الباقة الأنسب لطبيعة نمو مشروعك وميزانيتك"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isEn
            ? "Full flexibility from a lean initial MVP launch to scalable, enterprise-grade cloud architecture."
            : "نقدم مرونة كاملة تبدأ من إطلاق النسخة التجريبية الأساسية وحتى البنية التحتية المتكاملة للشركات الكبرى."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => {
          const isSelected = activeTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => handleSelect(tier.id)}
              className={cn(
                "relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden p-6",
                tier.isPopular
                  ? "border-primary/60 bg-gradient-to-b from-primary/5 via-card to-card shadow-lg ring-2 ring-primary/30"
                  : "border-border/70 bg-card hover:border-primary/40 hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-xl"
              )}
            >
              {tier.isPopular && (
                <div className="absolute top-0 end-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-es-xl flex items-center gap-1 shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{isEn ? "Most Popular & Best Value" : "الأكثر اختياراً وقيمة"}</span>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-foreground">
                    {isEn ? tier.title_en : tier.title_ar}
                  </h4>
                  {isSelected && (
                    <Badge variant="default" className="text-[10px] bg-primary">
                      {isEn ? "Selected" : "محددة"}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground min-h-[32px]">
                  {isEn ? tier.tagline_en : tier.tagline_ar}
                </p>

                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">
                      {tier.priceEgp.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {currency}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>
                      {isEn
                        ? `Estimated Timeline: ${tier.deliveryWeeks} weeks`
                        : `مدة التنفيذ المقدرة: ${tier.deliveryWeeks} أسابيع`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deliverables List */}
              <div className="space-y-3 flex-1">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{isEn ? "Included Deliverables & Scope:" : "المخرجات والمزايا المضمنة:"}</span>
                </div>
                <ul className="space-y-2 text-xs">
                  {(isEn ? tier.features_en : tier.features_ar).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-foreground/90">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support & SLA */}
              <div className="mt-6 pt-4 border-t border-border/60 text-xs space-y-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>{isEn ? tier.support_en : tier.support_ar}</span>
                </div>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full text-xs font-bold transition-all cursor-pointer",
                    isSelected ? "shadow-md" : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(tier.id);
                  }}
                >
                  {isSelected
                    ? (isEn ? "Currently Selected Tier ✓" : "الباقة المختارة حالياً ✓")
                    : (isEn ? "Select This Tier" : "اختيار هذه الباقة")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
