"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Clock,
  Coins,
  Copy,
  Check,
  Zap,
  Users,
  ShieldCheck,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";

interface RoiCalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoiCalculatorDialog({ open, onOpenChange }: RoiCalculatorDialogProps) {
  const [employeesCount, setEmployeesCount] = useState<number>(6);
  const [avgSalary, setAvgSalary] = useState<number>(14000); // 14k EGP
  const [hoursWastedPerWeek, setHoursWastedPerWeek] = useState<number>(8); // 8 hours wasted
  const [softwarePrice, setSoftwarePrice] = useState<number>(120000); // 120k EGP
  const [efficiencyBoostPercent, setEfficiencyBoostPercent] = useState<number>(65); // 65% efficiency gain
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => {
    // 160 working hours per month per employee
    const hourlyRate = avgSalary / 160;
    const monthlyWastedHours = employeesCount * hoursWastedPerWeek * 4.33;
    const monthlyWastedCost = monthlyWastedHours * hourlyRate;

    // Actual savings captured by software automation
    const monthlySavings = Math.round(monthlyWastedCost * (efficiencyBoostPercent / 100));
    const annualSavings = monthlySavings * 12;
    const threeYearSavings = monthlySavings * 36;

    // Payback period in months
    const paybackMonths =
      monthlySavings > 0 ? (softwarePrice / monthlySavings).toFixed(1) : "0";

    // 3-Year ROI %
    const threeYearNetBenefit = threeYearSavings - softwarePrice;
    const roiPercentage =
      softwarePrice > 0 ? Math.round((threeYearNetBenefit / softwarePrice) * 100) : 0;

    return {
      monthlyWastedHours: Math.round(monthlyWastedHours),
      monthlySavings,
      annualSavings,
      threeYearSavings,
      threeYearNetBenefit,
      paybackMonths,
      roiPercentage,
    };
  }, [employeesCount, avgSalary, hoursWastedPerWeek, softwarePrice, efficiencyBoostPercent]);

  const handleCopyPitch = () => {
    sounds.copy();
    const text = `💡 دراسة الجدوى والعائد الاستثماري (ROI) للنظام البرمجي:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 حجم فريق العمل المستهدف: ${employeesCount} موظف
⏱️ إجمالي الساعات المهدرة في الإدخال اليدوي شهرياً: ${analysis.monthlyWastedHours} ساعة
💰 الوفر المالي الشهري المحقق: ${analysis.monthlySavings.toLocaleString("ar-EG")} ج.م
📅 فترة استرداد الاستثمار (Payback Period): ${analysis.paybackMonths} أشهر فقط!

📈 مؤشرات الربحية على مدار 3 سنوات:
• إجمالي الوفر المالي: ${analysis.threeYearSavings.toLocaleString("ar-EG")} ج.م
• صافي العائد بعد استرداد التكلفة: ${analysis.threeYearNetBenefit.toLocaleString("ar-EG")} ج.م
• نسبة العائد على الاستثمار (ROI): +${analysis.roiPercentage}%

🎯 الخلاصة للمدير المالي / العميل:
"استثماركم في رقمنة وأتمتة العمليات لا يمثل تكلفة تشغيلية، بل هو استثمار رابح يغطي تكلفته في غضون ${analysis.paybackMonths} أشهر، ويمنح الشركة أصولاً رقمية تعزز الإنتاجية بنسبة ${efficiencyBoostPercent}%."`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">حاسبة العائد الاستثماري وسرعة استرداد التكلفة</DialogTitle>
              <DialogDescription>
                أداة إقناع حاسمة لاجتماعات المبيعات؛ تبرهن للعميل ولإدارته المالية سرعة استرداد قيمة البرنامج.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  عدد الموظفين المشاركين في العمليات اليدوية
                </span>
                <span className="font-bold text-primary">{employeesCount} موظفين</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(Math.max(1, Number(e.target.value)))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>متوسط الراتب الشهري للموظف (ج.م)</span>
                <span className="font-bold text-primary">{avgSalary.toLocaleString("ar-EG")} ج.م</span>
              </Label>
              <Input
                type="number"
                step="1000"
                min="3000"
                value={avgSalary}
                onChange={(e) => setAvgSalary(Math.max(1000, Number(e.target.value)))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  ساعات الهدر الأسبوعية لكل موظف (إكسيل / متابعات)
                </span>
                <span className="font-bold text-amber-600">{hoursWastedPerWeek} ساعات/أسبوع</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="40"
                value={hoursWastedPerWeek}
                onChange={(e) => setHoursWastedPerWeek(Math.max(1, Number(e.target.value)))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                  قيمة الاستثمار في البرنامج / السيستم (ج.م)
                </span>
                <span className="font-bold text-primary">{softwarePrice.toLocaleString("ar-EG")} ج.م</span>
              </Label>
              <Input
                type="number"
                step="5000"
                min="10000"
                value={softwarePrice}
                onChange={(e) => setSoftwarePrice(Math.max(1000, Number(e.target.value)))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  نسبة توفير وقت الموظفين المتوقعة
                </span>
                <span className="font-bold text-emerald-600">{efficiencyBoostPercent}%</span>
              </Label>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={efficiencyBoostPercent}
                onChange={(e) => setEfficiencyBoostPercent(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Cards */}
          <div className="flex flex-col justify-between bg-card border rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                مؤشرات الجدوى الاقتصادية
              </span>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
                    فترة استرداد التكلفة
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                    {analysis.paybackMonths}
                    <span className="text-xs font-normal ms-1">أشهر</span>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <span className="text-[11px] text-primary font-medium block">
                    العائد الاستثماري (3 سنوات)
                  </span>
                  <span className="text-2xl font-black text-primary block mt-1">
                    +{analysis.roiPercentage}%
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الوفر المالي الشهري المحقق</span>
                  <span className="font-bold text-foreground">
                    {analysis.monthlySavings.toLocaleString("ar-EG")} ج.م / شهر
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">الوفر المالي السنوي</span>
                  <span className="font-bold text-foreground">
                    {analysis.annualSavings.toLocaleString("ar-EG")} ج.م / سنة
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">إجمالي الوفر لـ 3 سنوات</span>
                  <span className="font-bold text-foreground">
                    {analysis.threeYearSavings.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-emerald-600 font-semibold">
                  <span>صافي الأرباح المكتسبة بعد التكلفة</span>
                  <span>+{analysis.threeYearNetBenefit.toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground mt-4 leading-relaxed">
                💡 <strong className="text-foreground">حجة بيع قوية:</strong> كل شهر تأخير في اعتماد السيستم يهدر على شركتكم حوالي{" "}
                <span className="text-amber-600 font-bold">{analysis.monthlySavings.toLocaleString("ar-EG")} ج.م</span> في عمليات روتينية يمكن أتمتتها تماماً.
              </div>
            </div>

            <Button
              type="button"
              className="w-full gap-2 font-semibold"
              onClick={handleCopyPitch}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "تم نسخ دراسة الـ ROI بنجاح!" : "نسخ دراسة الجدوى للعميل (واتساب / إيميل)"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
