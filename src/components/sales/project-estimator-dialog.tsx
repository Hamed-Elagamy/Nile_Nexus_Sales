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
  Calculator,
  Laptop,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Bot,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";
import { useRouter } from "next/navigation";

interface ProjectEstimatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeatureModule {
  id: string;
  name_ar: string;
  category: "core" | "platform" | "advanced";
  days: number;
  baseCost: number; // in EGP
}

const AVAILABLE_MODULES: FeatureModule[] = [
  // Platforms
  { id: "web_app", name_ar: "منصة ويب متجاوبة (Next.js)", category: "platform", days: 12, baseCost: 35000 },
  { id: "mobile_app", name_ar: "تطبيق موبايل (Flutter iOS & Android)", category: "platform", days: 18, baseCost: 55000 },
  { id: "admin_portal", name_ar: "لوحة تحكم إدارية متقدمة (Admin Dashboard)", category: "platform", days: 10, baseCost: 30000 },
  
  // Core Modules
  { id: "auth_rbac", name_ar: "نظام إدارة المستخدمين والصلاحيات (RBAC)", category: "core", days: 4, baseCost: 12000 },
  { id: "payment_gw", name_ar: "بوابات الدفع الإلكتروني (Paymob / Fawry / Stripe)", category: "core", days: 5, baseCost: 15000 },
  { id: "notifications", name_ar: "نظام إشعارات واتساب وإيميل ورسائل SMS", category: "core", days: 4, baseCost: 12000 },
  { id: "reports_export", name_ar: "تقارير مالية وتحليلية وتصدير PDF / Excel", category: "core", days: 5, baseCost: 14000 },
  
  // Advanced & AI
  { id: "ai_bot", name_ar: "مساعد ذكاء اصطناعي مخصص وتلخيص ذكي (LLM)", category: "advanced", days: 8, baseCost: 28000 },
  { id: "realtime_ws", name_ar: "تزامن مباشر وتتبع لحظي (Realtime WebSockets)", category: "advanced", days: 6, baseCost: 18000 },
  { id: "erp_sync", name_ar: "ربط مع أنظمة ERP خارجية ومخازن (API Sync)", category: "advanced", days: 7, baseCost: 22000 },
];

export function ProjectEstimatorDialog({ open, onOpenChange }: ProjectEstimatorDialogProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState("مشروع مخصص جديد");
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([
    "web_app",
    "admin_portal",
    "auth_rbac",
    "reports_export",
  ]);
  const [marginPercent, setMarginPercent] = useState<number>(35); // 35% margin
  const [maintenanceMonths, setMaintenanceMonths] = useState<number>(3);
  const [copied, setCopied] = useState(false);

  const toggleModule = (id: string) => {
    sounds.click();
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const selected = AVAILABLE_MODULES.filter((m) => selectedModuleIds.includes(m.id));
    const totalDays = selected.reduce((acc, curr) => acc + curr.days, 0);
    const baseDevCost = selected.reduce((acc, curr) => acc + curr.baseCost, 0);

    // Maintenance cost (approx 10% of base dev per 3 months)
    const maintenanceCost = Math.round((baseDevCost * 0.035) * maintenanceMonths);

    // Total Cost
    const totalDirectCost = baseDevCost + maintenanceCost;

    // Selling price based on margin: price = cost / (1 - margin)
    const marginDecimal = marginPercent / 100;
    const finalSellingPrice = Math.round(totalDirectCost / (1 - marginDecimal));
    const profitMarginValue = finalSellingPrice - totalDirectCost;

    // Timeline estimate in weeks (assuming parallel tracks for multidisciplinary team)
    const estimatedWeeks = Math.max(2, Math.ceil(totalDays / 5 * 0.75));

    // Three tiers based on scope:
    const mvpPrice = Math.round(finalSellingPrice * 0.7);
    const enterprisePrice = Math.round(finalSellingPrice * 1.45);

    return {
      selectedCount: selected.length,
      totalDays,
      estimatedWeeks,
      totalDirectCost,
      finalSellingPrice,
      profitMarginValue,
      maintenanceCost,
      mvpPrice,
      enterprisePrice,
    };
  }, [selectedModuleIds, marginPercent, maintenanceMonths]);

  const handleCopySummary = () => {
    sounds.copy();
    const text = `📊 تقدير نطاق وتكلفة: ${projectName}
━━━━━━━━━━━━━━━━━━━━
⏱️ مدة التنفيذ المقدرة: ${calculation.estimatedWeeks} أسابيع (${calculation.totalDays} يوم عمل)
🛠️ عدد الموديولات المختارة: ${calculation.selectedCount} موديول
🛡️ الدعم الفني والضمان: ${maintenanceMonths} أشهر

💰 خيارات التسعير المقترحة:
1. النسخة المصغرة (MVP): ${calculation.mvpPrice.toLocaleString("ar-EG")} ج.م
2. النطاق المتكامل (الموصى به): ${calculation.finalSellingPrice.toLocaleString("ar-EG")} ج.م
3. الباقة المتقدمة الشاملة: ${calculation.enterprisePrice.toLocaleString("ar-EG")} ج.م

✨ تم إعداد التقدير عبر محرك تسعير Nile Nexus Sales.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateDealWithEstimate = () => {
    sounds.success();
    onOpenChange(false);
    // Navigate to deals new with prepopulated query
    router.push(
      `/deals/new?name=${encodeURIComponent(projectName)}&amount=${calculation.finalSellingPrice}`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">حاسبة نطاق وتكلفة المشاريع (Scope & Tech Estimator)</DialogTitle>
              <DialogDescription>
                اختر المنصات والموديولات لحساب أيام العمل، التكلفة المباشرة، وهامش الربح بدقة متناهية.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Module Selector (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <Label className="text-xs font-semibold">اسم المشروع أو العميل</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: منصة تجارة إلكترونية متكاملة"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">المنصات والموديولات البرمجية</Label>
                <span className="text-xs text-muted-foreground">
                  تم تحديد {calculation.selectedCount} من {AVAILABLE_MODULES.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map((mod) => {
                  const isSelected = selectedModuleIds.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3 rounded-lg border text-start transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/60 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug">{mod.name_ar}</span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                        <span>{mod.days} يوم عمل</span>
                        <span className="font-semibold text-foreground">
                          {mod.baseCost.toLocaleString("ar-EG")} ج.م
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div>
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>هامش الربح المستهدف</span>
                  <span className="text-primary font-bold">{marginPercent}%</span>
                </Label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value))}
                  className="w-full mt-2 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>15% (منافس)</span>
                  <span>35% (قياسي)</span>
                  <span>60% (فاخر)</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>فترة الدعم والضمان</span>
                  <span className="text-primary font-bold">{maintenanceMonths} أشهر</span>
                </Label>
                <div className="flex gap-1.5 mt-2">
                  {[0, 3, 6, 12].map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={maintenanceMonths === m ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setMaintenanceMonths(m)}
                    >
                      {m === 0 ? "بدون" : `${m}ش`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Tiering (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">ملخص التقدير المالي</span>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                  دقة 95%
                </Badge>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    المدة التنفيذية المتوقعة
                  </span>
                  <span className="font-bold">{calculation.estimatedWeeks} أسابيع ({calculation.totalDays} يوم)</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    التكلفة المباشرة (Dev Cost)
                  </span>
                  <span>{calculation.totalDirectCost.toLocaleString("ar-EG")} ج.م</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    صافي الربح المتوقع ({marginPercent}%)
                  </span>
                  <span className="text-emerald-600 font-bold">
                    +{calculation.profitMarginValue.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-center my-3">
                  <span className="text-xs text-primary font-medium block">سعر البيع المقترح (النهائي)</span>
                  <span className="text-2xl font-black text-primary tracking-tight">
                    {calculation.finalSellingPrice.toLocaleString("ar-EG")}
                    <span className="text-xs font-normal ms-1">ج.م</span>
                  </span>
                </div>

                {/* 3-Tier Proposal Preview */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold block text-muted-foreground">الباقات الثلاث المقترحة للعميل:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-2 rounded border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">MVP</span>
                      <span className="text-xs font-bold text-foreground block">
                        {(calculation.mvpPrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="p-2 rounded border border-primary/40 bg-primary/5">
                      <span className="text-[10px] text-primary font-bold block">موصى به ⭐</span>
                      <span className="text-xs font-bold text-primary block">
                        {(calculation.finalSellingPrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="p-2 rounded border border-border/60 bg-muted/20">
                      <span className="text-[10px] text-muted-foreground block">Enterprise</span>
                      <span className="text-xs font-bold text-foreground block">
                        {(calculation.enterprisePrice / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                type="button"
                className="w-full gap-2 font-semibold"
                onClick={handleCreateDealWithEstimate}
              >
                <span>إنشاء صفقة بهذا التقدير</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={handleCopySummary}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "تم نسخ الملخص التنفيذي بنجاح!" : "نسخ ملخص العميل (واتساب / إيميل)"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
