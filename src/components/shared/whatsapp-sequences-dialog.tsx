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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Send,
  Calendar,
  Sparkles,
  User,
  Building2,
  Phone,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";
import { toast } from "sonner";

interface WhatsAppSequencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPhone?: string;
  defaultClientName?: string;
  defaultCompanyName?: string;
}

interface SequenceStep {
  stepNumber: number;
  dayLabel: string;
  title_ar: string;
  objective: string;
  template: (vars: { clientName: string; companyName: string; repName: string }) => string;
}

const SEQUENCES: Array<{
  id: string;
  name_ar: string;
  category: "lead_nurturing" | "deal_closing" | "revival";
  steps: SequenceStep[];
}> = [
  {
    id: "lead_drip",
    name_ar: "سلسلة التأهيل الأولى للعملاء الجدد (4 خطوات)",
    category: "lead_nurturing",
    steps: [
      {
        stepNumber: 1,
        dayLabel: "اليوم 0 (فوري)",
        title_ar: "الترحيب وسابقة الأعمال",
        objective: "كسر الجليد ومشاركة ملف الأعمال وكتالوج الخدمات المعتمد",
        template: ({ clientName, companyName, repName }) =>
          `أهلاً بحضرتك يا ${clientName || "فندم"}، معاك ${repName} من فريق حلول الأعمال في Nile Nexus البرمجية 🚀

سعداء بالتواصل مع ${companyName ? `إدارة ${companyName}` : "حضرتك"}! بناءً على تواصلنا المبدئي، حابب أشارك مع حضرتك ملف سابقة أعمالنا وأبرز الحلول والمنصات اللي طورناها لشركات رائدة في السوق المصري والخليجي.

تقدر تتصفح كتالوج حلولنا هنا ومستعد لأي استفسار:
https://nile-nexus-sales.vercel.app/services

يومك سعيد وبالتوفيق دايماً!`,
      },
      {
        stepNumber: 2,
        dayLabel: "اليوم 2",
        title_ar: "استكشاف التحديات والعمليات",
        objective: "طرح سؤال مفتوح ذكي حول أكبر عقبة تواجه الفريق حالياً",
        template: ({ clientName, companyName }) =>
          `صباح الخير يا ${clientName || "فندم"}، أتمنى يوم حضرتك يكون موفق ✨

كنت حابب أسأل حضرتك سؤال سريع بخصوص دورة العمل في ${companyName || "الشركة"}:
إيه أكتر تحدي أو عملية بتستهلك وقت الفريق عندكم حالياً؟ (سواء كانت متابعة المبيعات، الفواتير، المخازن، أو شيتات الإكسيل اليدوية؟)

حابب أساعدكم بتصور عملي مجاني يوضح إزاي رقمنة النقطة دي بالتحديد ممكن توفر عليكم ساعات عمل أسبوعية.`,
      },
      {
        stepNumber: 3,
        dayLabel: "اليوم 5",
        title_ar: "قصة نجاح وعائد استثماري (ROI)",
        objective: "تقديم إثبات جدارة عبر تجربة عميل سابق في نفس النشاط",
        template: ({ clientName, companyName }) =>
          `مساء الخير يا ${clientName || "فندم"} 👋

حابب أشارك حضرتك تجربة سريعة لإحدى الشركات اللي كانت بتواجه نفس تحدي التوسع في ${companyName ? `مجالكم` : "السوق"}.
بعد تطبيق النظام المخصص من Nile Nexus، قدروا:
1. تقليص زمن إعداد التقارير والفواتير بنسبة 70%.
2. منع تسرب العملاء والبيانات وضمان متابعة 100% من الفرص.
3. استرداد كامل تكلفة التطوير في أقل من 5 أشهر فقط!

هل تحب نجهز لحضرتك دراسة جدوى مختصرة بنفس الطريقة لـ ${companyName || "شركتكم"}؟`,
      },
      {
        stepNumber: 4,
        dayLabel: "اليوم 8",
        title_ar: "دعوة لجلسة ديمو استشارية (20 دقيقة)",
        objective: "طلب حجز اجتماع أونلاين وتحديد موعد محدد",
        template: ({ clientName }) =>
          `أهلاً يا ${clientName || "فندم"}، 

عشان وقت حضرتك الثمين، إيه رأيك ننظم جلسة استشارية سريعة لمدة 20 دقيقة عبر Google Meet أو مكالمة هاتفية؟
هنستعرض فيها واجهات النظام ونشرح عملياً إزاي السيستم هيخدم احتياجاتكم بدون أي التزام بالشراء.

يناسب حضرتك يوم الثلاثاء الساعة 2 ظهراً ولا الأربعاء الساعة 11 صباحاً؟`,
      },
    ],
  },
  {
    id: "ghosted_revival",
    name_ar: "سلسلة إحياء العملاء الصامتين والمماطلين (3 خطوات)",
    category: "revival",
    steps: [
      {
        stepNumber: 1,
        dayLabel: "بعد 10 أيام",
        title_ar: "اطمئنان ودي بدون ضغط",
        objective: "إعادة فتح المحادثة بلباقة ودون إشعار العميل بالذنب",
        template: ({ clientName }) =>
          `أهلاً بحضرتك يا ${clientName || "فندم"}، لعلك والأسرة الكريمة بألف خير يا رب 🌸

حابب أطمن على حضرتك وأعرف لو الأمور تمام عندك في الشغل. 
هل كان عند حضرتك فرصة لمراجعة النقاط اللي اتكلمنا فيها، ولا في أي تفاصيل إضافية تحب نوضحها؟`,
      },
      {
        stepNumber: 2,
        dayLabel: "بعد 16 يوم",
        title_ar: "تحديث الأسعار وحجز فريق العمل",
        objective: "خلق دافع استعجال حقيقي (Urgency) بسبب جدول المطورين",
        template: ({ clientName, companyName }) =>
          `مساء الخير يا ${clientName || "فندم"}،

حابب أبلغ حضرتك إننا بنقفل الجداول الزمنية لمشاريع الشهر القادم مع فريق التطوير في Nile Nexus. 
حابين جداً نضمن حجز فريق العمل لمشروع ${companyName || "حضرتكم"} بنفس خطة الأسعار والدفعات الميسرة اللي اتفقنا عليها قبل اكتمال الحجوزات.

هل المشروع ما زال ضمن أولوياتكم في الوقت الحالي؟`,
      },
      {
        stepNumber: 3,
        dayLabel: "بعد 25 يوم (الرسالة الختامية)",
        title_ar: "إغلاق الملف بكرامة (Break-up Message)",
        objective: "إشعار العميل بأنك ستتوقف عن المتابعة، وهو ما يدفع 40% منهم للرد فوراً",
        template: ({ clientName, companyName, repName }) =>
          `أهلاً يا ${clientName || "فندم"}،

يبدو إن توقيت إطلاق وتطوير السيستم مش مناسب لحضرتك أو لـ ${companyName || "الشركة"} في الوقت الحالي، وأنا متفهم ده جداً ومقدّر انشغالك.

أنا هقفل الملف مؤقتاً عشان مسببش لحضرتك أي إزعاج، ورقمي مع حضرتك في أي وقت تحب نبدأ فيه مستقبلاً.

كل التوفيق لحضرتك يا فندم! 
تحياتي، ${repName} - Nile Nexus.`,
      },
    ],
  },
];

export function WhatsAppSequencesDialog({
  open,
  onOpenChange,
  defaultPhone = "",
  defaultClientName = "",
  defaultCompanyName = "",
}: WhatsAppSequencesDialogProps) {
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>("lead_drip");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [clientName, setClientName] = useState(defaultClientName);
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [phone, setPhone] = useState(defaultPhone);
  const [repName, setRepName] = useState("محمد حامد");
  const [copied, setCopied] = useState(false);

  const activeSequence =
    SEQUENCES.find((s) => s.id === selectedSequenceId) || SEQUENCES[0];
  const activeStep = activeSequence.steps[activeStepIndex] || activeSequence.steps[0];

  const generatedMessage = useMemo(() => {
    return activeStep.template({
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      repName: repName.trim(),
    });
  }, [activeStep, clientName, companyName, repName]);

  const cleanPhone = useMemo(() => {
    let p = phone.replace(/[^0-9]/g, "");
    if (p.startsWith("01") && p.length === 11) {
      p = "2" + p;
    }
    return p;
  }, [phone]);

  const handleLaunchWhatsApp = () => {
    sounds.click();
    if (!cleanPhone) {
      toast.error("يرجى إدخال رقم الهاتف أولاً لإرسال الرسالة");
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    sounds.copy();
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success("تم نسخ نص الرسالة بنجاح!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">سلاسل رسائل الواتساب المتتابعة (WhatsApp Sequences)</DialogTitle>
              <DialogDescription>
                حملات متابعة متسلسلة خطوة بخطوة باللغة المصرية الودية لزيادة معدل الردود وحجز الجلسات الاستشارية.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Controls & Variables (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Sequence Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">نوع سلسلة المتابعة</label>
              <div className="space-y-1.5">
                {SEQUENCES.map((seq) => (
                  <button
                    key={seq.id}
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setSelectedSequenceId(seq.id);
                      setActiveStepIndex(0);
                    }}
                    className={`w-full text-start p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedSequenceId === seq.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {seq.name_ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Inputs */}
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-3">
              <span className="text-xs font-bold text-muted-foreground block">بيانات التخصيص التلقائي:</span>

              <div>
                <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  اسم العميل
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: أ. أحمد الشناوي"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  اسم الشركة / النشاط
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: مجموعة الأفق للتجارة"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  رقم الواتساب
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">اسم المندوب</label>
                <Input
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* Sequence Steps & Message Preview (Right 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-card border rounded-xl p-5 space-y-4">
            <div className="space-y-4">
              {/* Step Tabs */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  مراحل السلسلة الزمنية:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {activeSequence.steps.map((st, idx) => {
                    const isSelected = activeStepIndex === idx;
                    return (
                      <Button
                        key={idx}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          sounds.click();
                          setActiveStepIndex(idx);
                        }}
                        className={`text-xs h-8 shrink-0 gap-1.5 ${
                          isSelected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        }`}
                      >
                        <span className="font-bold">خطوة {st.stepNumber}</span>
                        <span className="text-[10px] opacity-80">({st.dayLabel})</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Step Metadata */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <span>{activeStep.title_ar}</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {activeStep.dayLabel}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{activeStep.objective}</p>
              </div>

              {/* Live Preview Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">معاينة نص الرسالة المولدة:</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {generatedMessage.length} حرف
                  </span>
                </div>
                <Textarea
                  value={generatedMessage}
                  readOnly
                  rows={8}
                  className="font-sans text-xs leading-relaxed bg-muted/30 resize-none"
                />
              </div>
            </div>

            {/* Launch & Copy Actions */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "تم النسخ!" : "نسخ الرسالة"}</span>
              </Button>

              <Button
                type="button"
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleLaunchWhatsApp}
              >
                <Send className="h-4 w-4" />
                <span>إرسال عبر واتساب</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
