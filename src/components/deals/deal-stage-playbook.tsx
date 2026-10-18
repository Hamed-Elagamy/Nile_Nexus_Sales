"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Target,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DealStage } from "@/lib/schemas/deal";

interface DealStagePlaybookProps {
  stage: DealStage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenBattlecards?: () => void;
  onOpenWhatsApp?: () => void;
}

interface StageGuide {
  title_ar: string;
  stageName_ar: string;
  badgeColor: string;
  goal_ar: string;
  keyQuestions_ar: string[];
  actionSteps_ar: string[];
  proTip_ar: string;
  exitCriteria_ar: string;
}

const STAGE_PLAYBOOKS: Record<DealStage, StageGuide> = {
  NEW: {
    title_ar: "دليل مرحلة العميل المحتمل (Lead Discovery)",
    stageName_ar: "عميل محتمل جديد",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    goal_ar: "التحقق السريع من مدى جدية العميل وملاءمته لخدماتنا البرمجية (Lead Qualification).",
    keyQuestions_ar: [
      "ما هي المشكلة الأساسية الحالية في إدارة البيانات أو العمليات التشغيلية؟",
      "هل المشكلة تسبب خسارة في الوقت أو إهداراً في الأرباح حالياً؟",
      "من هو صاحب القرار التنفيذي النهائي في اختيار الحل البرمجي الجديد؟",
      "هل تم رصد ميزانية محددة لتطوير هذا النظام خلال الربع المالي الحالي؟",
    ],
    actionSteps_ar: [
      "مراجعة موقع العميل وصفحاته للتأكد من حجم النشاط وعدد الفروع.",
      "إرسال رسالة ترحيبية مهنية مع ملف سابقة الأعمال عبر واتساب.",
      "تحديد موعد مكالمة استكشافية (Discovery Call) مدتها 15 دقيقة خلال 24 ساعة.",
    ],
    proTip_ar: "لا تتحدث عن الأسعار في أول دقيقة! ركّز أولاً على فهم التحديات التشغيلية التي تجعل الحل استثماراً مربحاً له.",
    exitCriteria_ar: "الانتقال إلى (تواصل) بمجرد إجراء مكالمة الاستكشاف والاتفاق على جلسة عرض تفصيلية.",
  },
  CONTACTED: {
    title_ar: "دليل مرحلة التواصل الأولي (Initial Contact)",
    stageName_ar: "تم التواصل الأولي",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    goal_ar: "تأكيد الاهتمام وتحديد موعد اجتماع عرض المنظومة ودراسة المتطلبات.",
    keyQuestions_ar: [
      "ما هي أهم 3 وظائف تريد رؤيتها في النظام الجديد؟",
      "ما هي الأنظمة أو ملفات Excel التي تستخدمها الشركة حالياً؟",
      "كم عدد الموظفين والمستخدمين الذين سيتعاملون مع البرنامج يومياً؟",
      "ما هو التوقيت المستهدف لديكم لتشغيل المنظومة وبدء العمل الفعلي؟",
    ],
    actionSteps_ar: [
      "إرسال رسالة توكيد الموعد عبر واتساب مع رابط المقابلة.",
      "تجهيز نماذج سابقة أعمال مشابهة لمجال العميل.",
      "إرسال استبيان متطلبات مصغر قبل الاجتماع بيوم.",
    ],
    proTip_ar: "دع العميل يتحدث 70% من وقت الاجتماع. كلما شرح ألمه بكلماته، أصبح قرار الشراء أسهل عليه.",
    exitCriteria_ar: "الانتقال إلى (مهتم) بعد إتمام الاجتماع والتأكد من وجود رغبة حقيقية.",
  },
  INTERESTED: {
    title_ar: "دليل مرحلة دراسة الاحتياج والعرض التجريبي (Deep Discovery)",
    stageName_ar: "مهتم وجاري دراسة الحل",
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    goal_ar: "عرض القيمة المضافة وإثبات كيف توفر منظومتنا البرمجية الوقت والتكاليف للعميل عبر ديمو عملي.",
    keyQuestions_ar: [
      "لو طبقنا المنظومة البرمجية اليوم، ما هو أول مؤشر نجاح تريد رؤيته؟",
      "هل هناك اشتراطات أمان أو سيرفرات داخلية خاصة؟",
      "هل تفضل باقة متكاملة أم إطلاق تدريجي على مراحل؟",
    ],
    actionSteps_ar: [
      "استعراض ديمو حي لبرنامج مماثل في نفس قطاع العميل.",
      "استخدام حاسبة العائد على الاستثمار (ROI Calculator) لإظهار فترة استرداد رأس المال.",
      "حصر المتطلبات بدقة وتجهيز ملخص النطاق الفني (Scope of Work).",
    ],
    proTip_ar: "ركز على تبسيط التكنولوجيا وتوضيح كيف يرى المدير العام التقارير بسهولة من هاتفه.",
    exitCriteria_ar: "الانتقال إلى (إرسال العرض) بعد اعتماد نطاق العمل وحساب التكاليف بالـ Estimator.",
  },
  PROPOSAL_SENT: {
    title_ar: "دليل مرحلة تقديم ومناقشة العرض المالي (Proposal Review)",
    stageName_ar: "تم إرسال العرض المالي",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    goal_ar: "شرح بنود العرض وتوضيح القيمة الاستثمارية مع إتاحة خيارات باقات مرنة (3-Tier).",
    keyQuestions_ar: [
      "هل تفضل باقة الإطلاق السريع (MVP) أم الباقة الاحترافية الشاملة (Growth)؟",
      "هل بنود جدول الدفعات المرحلية تتناسب مع السيولة والتدفقات النقدية لديكم؟",
      "هل تحتاج الشركة إلى فاتورة إلكترونية معتمدة وإضافة ضريبة القيمة المضافة 14%؟",
    ],
    actionSteps_ar: [
      "إرسال رابط العرض الرقمي المخصص للعميل لتمكينه من التوقيع الإلكتروني مباشرة.",
      "تحديد مكالمة مراجعة مخصصة خلال 48 ساعة من إرسال العرض للإجابة على التساؤلات.",
      "إرسال دراسة حالة (Case Study) لعميل مماثل حقق نمواً بعد تطبيق النظام.",
    ],
    proTip_ar: "لا ترسل العرض عبر الإيميل وتختفي! أرسله مع رسالة صوتية ودودة واقترح موعداً محدداً لمناقشة التفاصيل معاً.",
    exitCriteria_ar: "الانتقال إلى (تفاوض) إذا كان هناك تعديل على الأسعار أو البنود، أو مباشرة إلى (إغلاق ناجح) فور الاعتماد.",
  },
  NEGOTIATION: {
    title_ar: "دليل مرحلة التفاوض والاتفاق النهائي (Closing & Negotiation)",
    stageName_ar: "التفاوض والإغلاق",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    goal_ar: "تجاوز الاعتراضات وحسم الصفقة دون حرق الأسعار، بالاعتماد على التبادل المتكافئ.",
    keyQuestions_ar: [
      "لو اتفقنا على شروط دفع ميسرة تناسبكم، هل نحن جاهزون لبدء التنفيذ هذا الأسبوع؟",
      "ما هي النقطة الوحيدة المتبقية التي تفصلنا عن اعتماد العقد اليوم؟",
      "هل ترغب في البدء بالنسخة الأساسية لتوفير التكلفة ثم الترقية لاحقاً؟",
    ],
    actionSteps_ar: [
      "تطبيق قاعدة (Give-to-Get): إذا طلب العميل خصماً، اطلب مقابله تسريع مدة الدفعة الأولى أو حق نشر قصة النجاح.",
      "استخدام حاسبة الأقساط لتجزئة المبلغ على دفعات مريحة بدلاً من تخفيض القيمة الإجمالية.",
      "الاستعانة ببطاقات الاعتراضات (Battlecards) للرد على مقولة 'المنافس أرخص'.",
    ],
    proTip_ar: "الخصم السريع يقلل من ثقة العميل في جودة العمل! دافع عن قيمتك واقترح تسهيلات في الدفع أو خدمات تدريب إضافية.",
    exitCriteria_ar: "اعتماد العرض وتوقيعه إلكترونياً للانتقال إلى (إغلاق ناجح) أو تسجيل أسباب الخسارة لو تعثر الاتفاق.",
  },
  WON: {
    title_ar: "دليل إتمام التعاقد وبدء المشروع (Won & Kickoff)",
    stageName_ar: "صفقة ناجحة",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    goal_ar: "بدء رحلة عميل استثنائية، تحصيل دفعة التعاقد، وتسليم المشروع لفريق الهندسة والبرمجة.",
    keyQuestions_ar: [
      "من سيكون منسق المشروع التقني الأساسي من طرف شركتكم؟",
      "هل تفضلون التواصل اليومي عبر مجموعة WhatsApp مخصصة أم بريد إلكتروني؟",
    ],
    actionSteps_ar: [
      "تأكيد استلام الدفعة الأولى وإصدار إيصال السداد.",
      "جدولة اجتماع انطلاق المشروع (Kickoff Meeting) مع مدير المشاريع.",
      "إنشاء قناة تواصل مخصصة (WhatsApp Group / Slack) لضمان الشفافية وسرعة التفاعل.",
    ],
    proTip_ar: "الانطباع الأول بعد إغلاق الصفقة يحدد ما إذا كان العميل سيجلب لك 5 عملاء آخرين أم لا. اجعل الترحيب مبهراً!",
    exitCriteria_ar: "الصفقة مغلقة بنجاح ومحفوظة في سجلات الإنجازات والعمولات.",
  },
  LOST: {
    title_ar: "دليل التعامل مع الصفقات الخاسرة (Post-Mortem & Revival)",
    stageName_ar: "صفقة خاسرة",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    goal_ar: "توثيق أسباب عدم الاتفاق بصدق، الحفاظ على علاقة ودودة، وتحديد موعد لإعادة التنشيط.",
    keyQuestions_ar: [
      "ما هو السبب الحقيقي لعدم إتمام التعاقد حالياً؟",
      "هل هناك فرصة للتعاون مستقبلاً بعد شهرين أو ثلاثة؟",
    ],
    actionSteps_ar: [
      "تسجيل سبب الخسارة بدقة (السعر، المنافس، تأجيل المشروع) في نافذة التحليل.",
      "إرسال رسالة شكر راقية ومهنية تترك الباب مفتوحاً دائماً.",
      "ضبط تاريخ إعادة التنشيط (Resurface Date) بعد 90 يوماً لتفقد أحوال العميل.",
    ],
    proTip_ar: "أكثر من 30% من الصفقات الخاسرة بسبب المنافسين تعود إلينا بعد 3-6 أشهر عندما يفشل المنافس الرخيص في تسليم البرنامج!",
    exitCriteria_ar: "الصفقة محفوظة في الأرشيف ومجدولة لإعادة التنشيط التلقائي.",
  },
  LATER: {
    title_ar: "دليل الصفقات المؤجلة (On-Hold Pipeline)",
    stageName_ar: "مؤجلة لوقت لاحق",
    badgeColor: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    goal_ar: "الحفاظ على دفء العلاقة عبر رسائل تنقيط (Nurturing Drip) ومتابعة دورية لطيفة.",
    keyQuestions_ar: [
      "متى تتوقعون عودة النشاط في هذه المبادرة التقنية؟",
      "هل يمكننا إرسال تحديثات مشاريعنا الجديدة لتبقوا على اطلاع؟",
    ],
    actionSteps_ar: [
      "إرسال نشرة شهرية أو دراسات حالة مفيدة دون إلحاح بيعي.",
      "تحديد تاريخ متابعة بالتقويم متزامن مع ربع السنة القادم.",
    ],
    proTip_ar: "العميل المؤجل ليس عميلاً ضائعاً. المتابعة الهادئة غير المزعجة تبني مصداقية عالية.",
    exitCriteria_ar: "إعادة تنشيط الصفقة ونقلها إلى (مهتم) أو (تواصل) عند عودة الاهتمام.",
  },
};

export function DealStagePlaybook({
  stage,
  open,
  onOpenChange,
  onOpenBattlecards,
  onOpenWhatsApp,
}: DealStagePlaybookProps) {
  const guide = STAGE_PLAYBOOKS[stage] || STAGE_PLAYBOOKS.NEW;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 mb-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{guide.title_ar}</span>
            </DialogTitle>
            <Badge variant="outline" className={guide.badgeColor}>
              {guide.stageName_ar}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 text-xs">
          {/* Main Goal Banner */}
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary text-sm">
              <Target className="h-4 w-4" />
              <span>الهدف الاستراتيجي لهذه المرحلة:</span>
            </div>
            <p className="text-foreground/90 font-medium leading-relaxed">
              {guide.goal_ar}
            </p>
          </div>

          {/* Key Qualification Questions */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              <span>أسئلة الاستكشاف والتأهيل الذكية (Discovery Questions):</span>
            </h4>
            <div className="space-y-1.5">
              {guide.keyQuestions_ar.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-2 text-foreground"
                >
                  <span className="font-mono font-bold text-primary shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action Steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>خطوات العمل الموصى بها للإغلاق السريع:</span>
            </h4>
            <div className="space-y-1.5">
              {guide.actionSteps_ar.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-card border border-border/70 flex items-start gap-2 text-foreground"
                >
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Pro-Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <Lightbulb className="h-4 w-4" />
              <span>نصيحة ذهبية من كبار مسؤولي المبيعات (Sales Pro-Tip):</span>
            </div>
            <p className="text-foreground/90 leading-relaxed font-medium">
              {guide.proTip_ar}
            </p>
          </div>

          {/* Exit Criteria */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-muted-foreground">
            <span className="font-semibold text-foreground">معيار الانتقال للمرحلة التالية:</span>
            <span className="text-[11px] text-primary font-medium">{guide.exitCriteria_ar}</span>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            {onOpenBattlecards && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenBattlecards();
                }}
                className="gap-1.5 text-xs border-amber-500/30 hover:bg-amber-500/10"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>فتح بطاقات الرد على الاعتراضات</span>
              </Button>
            )}

            {onOpenWhatsApp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenWhatsApp();
                }}
                className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <span>رسائل واتساب المتابعة التلقائية</span>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ms-auto text-xs"
            >
              فهمت، جاهز للتنفيذ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
