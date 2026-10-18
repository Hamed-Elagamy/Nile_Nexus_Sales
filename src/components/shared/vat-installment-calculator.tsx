"use client";

import React, { useState } from "react";
import { Calculator, Copy, Check, Percent, ArrowRightLeft, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { sounds } from "@/lib/utils/confetti-sound";

interface VatInstallmentCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAmount?: number;
}

export function VatInstallmentCalculator({
  open,
  onOpenChange,
  initialAmount = 50000,
}: VatInstallmentCalculatorProps) {
  const [baseAmount, setBaseAmount] = useState<number>(initialAmount);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [preset, setPreset] = useState<"standard" | "halves" | "quarters">("standard");
  const [copied, setCopied] = useState(false);

  const vatRate = 0.14;
  const vatAmount = includeVat ? baseAmount * vatRate : 0;
  const totalAmount = baseAmount + vatAmount;

  // Currency estimates
  const usdRate = 48.5;
  const sarRate = 12.9;
  const inUsd = Math.round(totalAmount / usdRate);
  const inSar = Math.round(totalAmount / sarRate);

  // Installments calculation
  const getInstallments = () => {
    if (preset === "standard") {
      // 40% - 30% - 30%
      return [
        { label: "دفعة مقدمة عند التعاقد (40%)", amount: Math.round(totalAmount * 0.4) },
        { label: "دفعة بعد اعتماد التصاميم والـ Prototype (30%)", amount: Math.round(totalAmount * 0.3) },
        { label: "دفعة نهائية عند الإطلاق والتدريب (30%)", amount: Math.round(totalAmount * 0.3) },
      ];
    } else if (preset === "halves") {
      // 50% - 50%
      return [
        { label: "دفعة أولى عند التعاقد (50%)", amount: Math.round(totalAmount * 0.5) },
        { label: "دفعة ثانية عند التسليم النهائي (50%)", amount: Math.round(totalAmount * 0.5) },
      ];
    } else {
      // 25% - 25% - 25% - 25%
      return [
        { label: "دفعة 1: بدء العمل (25%)", amount: Math.round(totalAmount * 0.25) },
        { label: "دفعة 2: تسليم واجهات المستخدم (25%)", amount: Math.round(totalAmount * 0.25) },
        { label: "دفعة 3: اختبار بوابات الدفع والـ API (25%)", amount: Math.round(totalAmount * 0.25) },
        { label: "دفعة 4: التسليم النهائي والتدريب (25%)", amount: Math.round(totalAmount * 0.25) },
      ];
    }
  };

  const installments = getInstallments();

  const handleCopySummary = () => {
    sounds.playTactileClick();
    const text = `جدول الدفعات المالية والضريبة - Nile Nexus:
قيمة المشروع: ${baseAmount.toLocaleString("ar-EG")} ج.م
${includeVat ? `ضريبة القيمة المضافة (14%): ${vatAmount.toLocaleString("ar-EG")} ج.م\n` : ""}الإجمالي النهائي: ${totalAmount.toLocaleString("ar-EG")} ج.م (ما يعادل ~$${inUsd.toLocaleString()} USD / ~${inSar.toLocaleString()} SAR)

جدول الأقساط المقترح:
${installments.map((i, idx) => `${idx + 1}. ${i.label}: ${i.amount.toLocaleString("ar-EG")} ج.م`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ جدول الحسابات والأقساط للحافظة بنجاح!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              حاسبة الضرائب 14% والأقساط الفورية
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              قيمة المشروع الأساسية (EGP):
            </label>
            <div className="relative">
              <Input
                type="number"
                value={baseAmount || ""}
                onChange={(e) => setBaseAmount(Number(e.target.value) || 0)}
                className="text-lg font-bold font-mono pe-14"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                ج.م
              </span>
            </div>
          </div>

          {/* Quick presets for amounts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[25000, 50000, 85000, 120000, 180000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBaseAmount(amt)}
                className="px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-[11px] font-mono shrink-0 cursor-pointer"
              >
                {amt.toLocaleString("ar-EG")}
              </button>
            ))}
          </div>

          {/* VAT Toggle & Summary Card */}
          <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-primary" />
                <span>ضريبة القيمة المضافة (14% VAT)</span>
              </span>
              <button
                type="button"
                onClick={() => setIncludeVat(!includeVat)}
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  includeVat
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {includeVat ? "مشمولة (+14%)" : "بدون ضريبة"}
              </button>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">الإجمالي المطلوب:</span>
              <div className="text-end">
                <span className="text-xl font-bold text-foreground font-mono">
                  {totalAmount.toLocaleString("ar-EG")}
                </span>
                <span className="text-xs text-muted-foreground ms-1">ج.م</span>
              </div>
            </div>

            {/* Currency conversion estimates */}
            <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-600" />
                <span>التقدير للخليج والدولار:</span>
              </span>
              <span className="font-mono">
                ~${inUsd.toLocaleString()} USD • ~{inSar.toLocaleString()} SAR
              </span>
            </div>
          </div>

          {/* Installment Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>خطة تقسيم الدفعات والأقساط:</span>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreset("standard")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    preset === "standard"
                      ? "bg-primary text-white font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  40-30-30
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("halves")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    preset === "halves"
                      ? "bg-primary text-white font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  50-50
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("quarters")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    preset === "quarters"
                      ? "bg-primary text-white font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  أرباع
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                >
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {inst.label}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {inst.amount.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              إغلاق
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopySummary}
              className="gap-1.5 text-xs bg-primary text-white cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "تم النسخ!" : "نسخ ملخص الدفعات"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
