"use client";

import React, { useState } from "react";
import { Copy, Check, Building, CreditCard, MapPin, Globe, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sounds } from "@/lib/utils/confetti-sound";

interface SmartSnippetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Snippet {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
}

const companySnippets: Snippet[] = [
  {
    id: "bank-cib",
    title: "الحساب البنكي الرسمي (CIB Egypt)",
    subtitle: "للتحويلات البنكية الرسمية للشركات والمؤسسات بالجنيه المصري",
    value: "البنك التجاري الدولي (CIB)\nاسم الحساب: شركة نايل نكسس للحلول البرمجية\nرقم الحساب: 100054329871\nIBAN: EG45001000000000100054329871\nالفرع: فرع التسعين، التجمع الخامس",
    icon: <CreditCard className="h-4 w-4 text-primary" />,
  },
  {
    id: "instapay",
    title: "عنوان الدفع الفوري (InstaPay)",
    subtitle: "للتحويلات الفورية السريعة للشركات والأفراد",
    value: "nilenexus@instapay",
    icon: <CreditCard className="h-4 w-4 text-emerald-600" />,
  },
  {
    id: "tax-commercial",
    title: "السجل التجاري والبطاقة الضريبية",
    subtitle: "للبيانات الضريبية والعقود الرسمية",
    value: "شركة نايل نكسس للبرمجيات وتكنولوجيا المعلومات\nسجل تجاري: 184592 (استثمار القاهرة)\nبطاقة ضريبية: 672-894-310 (مأمورية ضرائب الشركات المساهمة)",
    icon: <ShieldCheck className="h-4 w-4 text-violet-600" />,
  },
  {
    id: "location",
    title: "عنوان المقر ورابط خرائط جوجل (Google Maps)",
    subtitle: "لإرساله للعملاء القادمين للاجتماعات",
    value: "مقر شركة Nile Nexus:\nشارع التسعين الشمالي، القطاع الأول، التجمع الخامس، القاهرة الجديدة.\nرابط الموقع: https://maps.google.com/?q=Nile+Nexus+New+Cairo",
    icon: <MapPin className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "portfolio",
    title: "رابط الموقع الرسمي وسابقة الأعمال",
    subtitle: "لمشاركة معرض أعمال ومشاريع الشركة",
    value: "موقع Nile Nexus:\nhttps://nilenexus.eg\nكتالوج وسابقة الأعمال: https://nilenexus.eg/portfolio",
    icon: <Globe className="h-4 w-4 text-cyan-600" />,
  },
];

export function SmartSnippetsDialog({ open, onOpenChange }: SmartSnippetsDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (snippet: Snippet) => {
    sounds.playTactileClick();
    navigator.clipboard.writeText(snippet.value);
    setCopiedId(snippet.id);
    toast.success(`تم نسخ (${snippet.title}) للحافظة بنجاح!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Building className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              بنك الحسابات والنصوص للنسخ السريع
            </DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-xs text-muted-foreground leading-relaxed">
          انقر على أي بطاقة لنسخ بيانات الحساب أو السجل أو العنوان فوراً وإرسالها للعميل على واتساب أو الإيميل:
        </p>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pt-1 pe-1">
          {companySnippets.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-muted border border-border/60 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5">
                      {item.subtitle}
                    </p>
                    <pre className="text-[11px] font-mono text-muted-foreground/90 bg-muted/60 p-2 rounded-md whitespace-pre-wrap break-all border border-border/40 select-all">
                      {item.value}
                    </pre>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={isCopied ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCopy(item)}
                  className={`shrink-0 text-xs gap-1 cursor-pointer transition-all ${
                    isCopied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "تم النسخ" : "نسخ"}</span>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
