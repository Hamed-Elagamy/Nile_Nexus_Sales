"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MultiTierPackageMatrix } from "./multi-tier-package-matrix";
import { playWonSound, triggerConfetti } from "@/lib/utils/confetti-sound";
import { updateProposalVersionStatus, type ProposalWithRelations } from "@/lib/actions/proposals";
import { toast } from "sonner";

interface ClientDigitalProposalProps {
  proposal: ProposalWithRelations;
}

export function ClientDigitalProposal({ proposal }: ClientDigitalProposalProps) {
  const versions = proposal.versions || [];
  const activeVersion = versions[0] || null;

  const [selectedTier, setSelectedTier] = useState<"mvp" | "recommended" | "enterprise">("recommended");
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(activeVersion?.status === "ACCEPTED");
  const [signedAt, setSignedAt] = useState<string | null>(null);

  // Canvas signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isSigned) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isSigned) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleDigitalSign = async () => {
    if (!signerName.trim()) {
      toast.error("يرجى إدخال الاسم بالكامل للتوقيع");
      return;
    }
    if (!agreedToTerms) {
      toast.error("يرجى تأكيد الموافقة على بنود التعاقد");
      return;
    }
    if (!hasDrawnSignature) {
      toast.error("يرجى التوقيع في المربع المخصص للرسم");
      return;
    }
    if (!activeVersion) return;

    setIsSubmitting(true);
    try {
      const res = await updateProposalVersionStatus({
        version_id: activeVersion.id,
        status: "ACCEPTED",
      });

      if (res.success) {
        setIsSigned(true);
        const nowStr = new Date().toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setSignedAt(nowStr);
        playWonSound();
        triggerConfetti();
        toast.success("تم اعتماد وتوقيع العرض بنجاح! مبروك بداية شراكة واعدة 🚀");
      } else {
        toast.error(res.error || "تعذر إتمام التوقيع الرقمي، يرجى المحاولة لاحقاً");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ التوقيع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientName = proposal.client?.name || "العميل الكريم";
  const dealTitle = proposal.deal?.title || "مشروع برمجي مخصص";
  const totalAmount = Number(activeVersion?.grand_total || 120000);
  const subtotal = Number(activeVersion?.subtotal || 105263);
  const taxAmount = Number(activeVersion?.tax_amount || 14737);
  const discountAmount = Number(activeVersion?.discount_amount || 0);
  const currency = activeVersion?.currency || "EGP";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-foreground" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
              NN
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">نايل نيكسس للحلول البرمجية</div>
              <div className="text-[11px] text-muted-foreground">Nile Nexus Software Solutions</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة / حفظ PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 print:hidden"
              onClick={() => {
                const text = encodeURIComponent(`مرحباً نايل نيكسس، بخصوص عرض السعر رقم ${proposal.business_id}`);
                window.open(`https://wa.me/201000000000?text=${text}`, "_blank");
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>استفسار واتساب</span>
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-6 sm:p-10 shadow-sm">
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline" className="px-3 py-1 text-xs font-mono font-bold bg-background/80 border-primary/30">
                {proposal.business_id}
              </Badge>
              {isSigned ? (
                <Badge className="bg-emerald-600 text-white gap-1.5 px-3 py-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>معتمد وموقع إلكترونياً</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <Clock className="h-3.5 w-3.5" />
                  <span>بانتظار الاعتماد والتوقيع</span>
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                عرض أسعار وتطوير منظومة برمجية
              </h1>
              <p className="text-base text-muted-foreground font-medium">
                مقدم خصيصاً إلى السادة: <span className="text-foreground font-bold">{clientName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                المشروع: <span className="text-primary font-semibold">{dealTitle}</span>
              </p>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-border/60">
              <div>
                <span className="text-muted-foreground block">تاريخ الإصدار:</span>
                <span className="font-semibold text-foreground">
                  {new Date(proposal.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">مدة صلاحية العرض:</span>
                <span className="font-semibold text-foreground">15 يوماً من تاريخه</span>
              </div>
              <div>
                <span className="text-muted-foreground block">فترة التنفيذ المقترحة:</span>
                <span className="font-semibold text-foreground">
                  {activeVersion?.delivery_duration || "8 أسابيع عمل"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">شروط الدفع:</span>
                <span className="font-semibold text-foreground">
                  {activeVersion?.payment_terms || "دفعات مرحلية حسب الإنجاز"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Tier Multi-Option Section */}
        <div className="bg-card rounded-2xl border border-border/70 p-6 sm:p-8 shadow-sm">
          <MultiTierPackageMatrix
            basePrice={totalAmount}
            currency={currency}
            isClientView={true}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
          />
        </div>

        {/* Financial Summary & Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>جدول الدفعات والمراحل المالية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">الدفعة الأولى (50%) - مقدم التعاقد</div>
                  <div className="text-[11px] text-muted-foreground">عند توقيع العقد وبدء مرحلة التصميم وهندسة البرمجيات</div>
                </div>
                <div className="font-mono font-bold text-sm text-foreground">
                  {(totalAmount * 0.5).toLocaleString("en-US")} {currency}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">الدفعة الثانية (30%) - النسخة التجريبية (Beta)</div>
                  <div className="text-[11px] text-muted-foreground">عند استعراض النموذج الأولي والتأكد من تطابق الوظائف</div>
                </div>
                <div className="font-mono font-bold text-sm text-foreground">
                  {(totalAmount * 0.3).toLocaleString("en-US")} {currency}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">الدفعة الأخيرة (20%) - التسليم النهائي والإطلاق</div>
                  <div className="text-[11px] text-muted-foreground">بعد التدريب ونشر المنظومة على السيرفرات الحية</div>
                </div>
                <div className="font-mono font-bold text-sm text-foreground">
                  {(totalAmount * 0.2).toLocaleString("en-US")} {currency}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>الملخص المالي والضريبي الرسمي</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">قيمة الأعمال البرمجية:</span>
                <span className="font-mono font-semibold text-foreground">
                  {subtotal.toLocaleString("en-US")} {currency}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between py-1.5 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
                  <span>خصم شريك النجاح:</span>
                  <span className="font-mono font-semibold">
                    - {discountAmount.toLocaleString("en-US")} {currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">ضريبة القيمة المضافة (14%):</span>
                <span className="font-mono font-semibold text-foreground">
                  {taxAmount.toLocaleString("en-US")} {currency}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-bold text-foreground">إجمالي الاستثمار الشامل:</span>
                <div className="text-start">
                  <span className="text-2xl font-extrabold text-primary font-mono">
                    {totalAmount.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground ms-1">{currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms and Conditions Accordion */}
        <div className="bg-card rounded-2xl border border-border/70 p-6 text-xs space-y-3">
          <h4 className="font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>الشروط والأحكام الفنية والقانونية</span>
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {activeVersion?.terms_and_conditions ||
              "يلتزم الطرف الأول (نايل نيكسس) بتسليم الشفرة المصدرية كاملة مع التوثيق التقني، وتقديم ضمان خلو من العيوب البرمجية لمدة 90 يوماً من تاريخ الإطلاق. يحتفظ الطرف الثاني بكامل الملكية الفكرية وحقوق البيانات."}
          </p>
        </div>

        {/* E-Signature & Digital Acceptance Box */}
        <div className="rounded-3xl border-2 border-primary/30 bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">الاعتماد والتوقيع الإلكتروني</h3>
              <p className="text-xs text-muted-foreground">
                توقيعك أدناه يعد موافقة رسمية على بنود العرض وبدء إجراءات التعاقد والتنفيذ
              </p>
            </div>
          </div>

          {isSigned ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                تم اعتماد هذا العرض وتوقيعه رقمياً بنجاح
              </h4>
              <p className="text-xs text-muted-foreground">
                {signedAt ? `تاريخ ووقت التوقيع: ${signedAt}` : "تم تسجيل الاعتماد في سجلات المنظومة"}
              </p>
              <div className="text-[11px] font-mono text-muted-foreground">
                Signer Verification Hash: {proposal.id.slice(0, 16)}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    الاسم بالكامل للمفوض بالتوقيع <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="مثال: م. أيمن السعيد"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    المسمى الوظيفي / الصفة القانونية
                  </label>
                  <Input
                    placeholder="مثال: الرئيس التنفيذي / مدير التقنية"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Signature Canvas Pad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-foreground">
                    التوقيع الرقمي (بالماوس أو اللمس باليد على الشاشة) <span className="text-rose-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSignature}
                    className="text-[11px] text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    مسح وإعادة الرسم
                  </Button>
                </div>

                <div className="relative border-2 border-dashed border-border rounded-xl bg-background overflow-hidden h-36 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={144}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawnSignature && (
                    <div className="absolute pointer-events-none text-xs text-muted-foreground/60 flex items-center gap-1.5">
                      <span>وقع هنا بيدك أو بالماوس</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-border mt-0.5 text-primary focus:ring-primary"
                />
                <span className="text-muted-foreground leading-snug">
                  أقر بصفتي المخولة بموافقة الشركة على بنود عرض الأسعار والمواصفات الفنية الموضحة أعلاه، واعتمادها رسمياً لبدء إجراءات التعاقد والتنفيذ.
                </span>
              </label>

              {/* Submit Sign Button */}
              <Button
                onClick={handleDigitalSign}
                disabled={isSubmitting || !agreedToTerms || !signerName.trim() || !hasDrawnSignature}
                className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>اعتماد وتوقيع العرض إلكترونياً</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t border-border/40">
          <div>نايل نيكسس للحلول البرمجية الذكية — القاهرة، جمهورية مصر العربية</div>
          <div className="text-[11px]">رقم التسجيل الضريبي: 712-498-331 | جميع الحقوق محفوظة {new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  );
}
