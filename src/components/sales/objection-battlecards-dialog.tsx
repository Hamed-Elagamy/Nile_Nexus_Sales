"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Search,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Gift,
  Target,
} from "lucide-react";
import { sounds } from "@/lib/utils/confetti-sound";

interface ObjectionBattlecardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Battlecard {
  id: string;
  category: "السعر والميزانية" | "المنافسين والبدائل" | "التأجيل والمماطلة" | "الاعتمادية والتشغيل";
  objection: string;
  subtext: string;
  winningResponse: string;
  reversalQuestion: string;
  smartConcessions: string[];
}

const BATTLECARDS: Battlecard[] = [
  {
    id: "expensive",
    category: "السعر والميزانية",
    objection: "عرضكم غالي جداً وأعلى من ميزانيتنا",
    subtext: "العميل يرى الرقم كـ 'تكلفة' وليس 'أصل استثماري' يولد وفراً أو مبيعات إضافية.",
    winningResponse:
      "أنا متفهم تماماً يا فندم لحرصكم على كفاءة الإنفاق. لكن خلينا نوضح إن الرقم ده مش مجرد كود برمجي، ده استثمار بيوفر لشركتكم ما لا يقل عن 25 ساعة عمل أسبوعياً وبيمنع أخطاء فواتير وتتبع كانت بتكلفكم أضعاف الرقم ده سنوياً. هل الأولوية عندكم هي أقل سعر مبدئي، ولا استقرار النظام وحماية بياناتكم من أي تعطل أو اختراق؟",
    reversalQuestion: "لو استبعدنا مسألة السعر لدقيقة، هل شايف إن الحل ده بيلبي 100% من احتياجاتكم العملية؟",
    smartConcessions: [
      "تقسيم الدفعات على 4 أقساط متساوية مرتبطة بمراحل التسليم (Milestones)",
      "تقديم أول شهرين دعم فني وصيانة مجاناً",
      "إرجاء الموديول المتقدم للمرحلة الثانية لتقليل التكلفة المبدئية 25%",
    ],
  },
  {
    id: "competitor_cheaper",
    category: "المنافسين والبدائل",
    objection: "الشركة الفلانية عرضت علينا نفس السيستم بنصف السعر تقريباً",
    subtext: "العميل يقارن فقط قائمة الميزات الظاهرة دون إدراك الفوارق في كفاءة المعمارية والأمان وجودة الكود والدعم.",
    winningResponse:
      "تمام جداً يا فندم، وفي الواقع السوق مليان حلول بأسعار متفاوتة. لكن في البرمجيات تحديداً، التكلفة الأكبر مش في ثمن الشراء، التكلفة الحقيقية بتظهر لما السيستم يقع في أوقات الذروة، أو لما المطور المستقل ميردش على التليفون، أو لما تكتشفوا إن الكود غير قابل للتوسع. في Nile Nexus، بنسلمكم سورس كود موثق، وضمان استقرار 99.9%، وفريق دعم محلي تحت أمركم بعقد قانوني ملزم.",
    reversalQuestion: "هل الشركة التانية قدمت لحضرتك SLA محدد لسرعة الاستجابة للأعطال ونقل كامل لحقوق الملكية الفكرية؟",
    smartConcessions: [
      "جلسة تدريب إضافية حضورية لفريق الإدارة العليا مجاناً",
      "دمج تقرير مالي تحليلي إضافي مخصص بدون رسوم",
    ],
  },
  {
    id: "excel_works_fine",
    category: "المنافسين والبدائل",
    objection: "إحنا شغالين بإكسيل والحمد لله مستقرين ومش محتاجين سيستم دلوقتي",
    subtext: "العميل في منطقة الراحة (Comfort Zone) وخائف من مخاطر التغيير وجهد تدريب الفريق.",
    winningResponse:
      "الإكسيل أداة عظيمة يا فندم وبداية أي بيزنس ناجح! لكن الإكسيل بيبقى قنبلة موقوتة أول ما الفريق يكبر: مفيش سجل تتبع للتعديلات، أي موظف ممكن يمسح معادلة أو يسرب قاعدة بيانات العملاء برقم تليفونهم بالكامل، ومفيش تقارير لحظية للإدارة. السيستم مش جاي يلغي الإكسيل، ده جاي يحمي أسرار عملكم ويوفر تقارير بضغطة زر من الموبايل في أي مكان.",
    reversalQuestion: "كم ساعة أسبوعياً بتضيع في تجميع شيتات الإكسيل من الموظفين ومطابقتها قبل اتخاذ القرار؟",
    smartConcessions: [
      "خدمة استيراد وترحيل كافة بيانات الإكسيل الحالية مجاناً داخل العقد",
      "واجهات سهلة تشبه الجداول لتسهيل انتقال الموظفين بسلاسة",
    ],
  },
  {
    id: "delay_decision",
    category: "التأجيل والمماطلة",
    objection: "هنفكر في الموضوع ونرجعلك كمان شهرين أو بعد العيد",
    subtext: "التأجيل هو الرفض المهذب (Polite No) نتيجة عدم وضوح الأولوية أو الخوف من اتخاذ القرار.",
    winningResponse:
      "على راسي يا فندم، وبالتأكيد قرار زي ده بيحتاج دراسة وافية. بس حابب أشارك حضرتك نقطة هامة: فريق التطوير عندنا بيحجز المشاريع في جداول زمنية محددة لضمان الجودة، والبدء الآن معناه إن النظام هيكون شغال وبيقدم نتائج في الموسم القادم بدلاً من الانتظار. هل في نقطة معينة في العرض الفني حاسس إنها محتاجة توضيح أكتر؟",
    reversalQuestion: "لو بدأنا بعد شهرين، إيه اللي هيكون اتغير أو توفر وساعتها نقدر نقول إننا جاهزين؟",
    smartConcessions: [
      "تثبيت الأسعار الحالية وحجز فريق التطوير بدفعة تعاقد رمزية (10% فقط)",
      "البدء في مرحلة تحليل المتطلبات (Discovery) مجاناً هذا الأسبوع",
    ],
  },
  {
    id: "no_budget",
    category: "السعر والميزانية",
    objection: "معندناش ميزانية أو سيولة في الوقت الحالي",
    subtext: "مشكلة تدفق نقدي حقيقية أو اختبار لرغبة البائع في التنازل السريع.",
    winningResponse:
      "مقدّر تماماً الظروف الاقتصادية وإدارة التدفقات النقدية يا فندم. عشان كده إحنا في Nile Nexus بنقدم خطط سداد مرنة مرتبطة بالإنجاز الفعلي على مراحل، بحيث السيستم يبدأ يحقق وفراً ويدر عائداً يغطي هو نفسه تكلفة الأقساط اللاحقة.",
    reversalQuestion: "لو قدرنا نقسم التكلفة على دفعات متوافقة مع ميزانيتكم الشهرية، هل نقدر نبدأ هذا الشهر؟",
    smartConcessions: [
      "جدولة الدفعات على 4 إلى 6 دفعات شهرية ميسرة",
      "بدء المرحلة الأولى بنسخة MVP الأساسية وتأجيل الباقي",
    ],
  },
  {
    id: "adoption_fear",
    category: "الاعتمادية والتشغيل",
    objection: "خايفين الموظفين ما يعرفوش يتعاملوا معاه أو يرفضوا التغيير",
    subtext: "خوف إداري من مقاومة التغيير (Change Resistance) وفشل التدريب.",
    winningResponse:
      "تخوف في محله بنسبة 100% يا فندم! عشان كده فلسفة تصميم برامجنا مبنية على البساطة المطلقة واللغة العربية المصرية اليومية، مع دورات تدريبية عملية وفيديوهات توثيقية مسجلة لكل دور وظيفي. بالإضافة لوجود قناة دعم مباشر على واتساب لأي استفسار فوري.",
    reversalQuestion: "هل تحب نعمل ورشة عمل تجريبية لمدة 30 دقيقة للموظفين يجربوا الواجهات بنفسهم قبل التوقيع؟",
    smartConcessions: [
      "ورشة تدريب تفاعلية إضافية مجاناً مع تسجيل فيديو كامل للرجوع إليه",
      "متابعة يومية لأول أسبوعين تشغيل لحل أي ارتباك فوري",
    ],
  },
];

export function ObjectionBattlecardsDialog({ open, onOpenChange }: ObjectionBattlecardsDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [activeCardId, setActiveCardId] = useState<string>(BATTLECARDS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["الكل", "السعر والميزانية", "المنافسين والبدائل", "التأجيل والمماطلة", "الاعتمادية والتشغيل"];

  const filteredCards = BATTLECARDS.filter((card) => {
    const matchCat = selectedCategory === "الكل" || card.category === selectedCategory;
    const matchSearch =
      card.objection.toLowerCase().includes(search.toLowerCase()) ||
      card.winningResponse.toLowerCase().includes(search.toLowerCase()) ||
      card.subtext.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCard = BATTLECARDS.find((c) => c.id === activeCardId) || BATTLECARDS[0];

  const handleCopy = (card: Battlecard) => {
    sounds.copy();
    navigator.clipboard.writeText(card.winningResponse);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">دليل الرد على اعتراضات العملاء (Sales Objection Buster)</DialogTitle>
              <DialogDescription>
                بطاقات تميز وتكتيكات نفسية مجربة لإغلاق الصفقات وتحويل اعتراض العميل إلى فرصة تعاقد.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Categories */}
        <div className="space-y-3 mt-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن اعتراض... (مثال: غالي، إكسيل، منافس، ميزانية، تأجيل)"
              className="ps-9"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
          {/* Objections List (Left 5 Cols) */}
          <div className="md:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pe-1">
            {filteredCards.map((card) => {
              const isActive = card.id === activeCard.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    sounds.click();
                    setActiveCardId(card.id);
                  }}
                  className={`w-full text-start p-3 rounded-lg border transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/60 hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/80">
                      {card.category}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold line-clamp-2 leading-snug">{card.objection}</h4>
                </button>
              );
            })}
          </div>

          {/* Active Objection Deep-Dive (Right 7 Cols) */}
          <div className="md:col-span-7 bg-card border rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5 mb-1.5">
                  {activeCard.category}
                </Badge>
                <h3 className="text-base font-bold text-foreground leading-snug">{activeCard.objection}</h3>
              </div>

              {/* Psychology Subtext */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span>ما يعنيه العميل في الواقع (The Real Concern):</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{activeCard.subtext}</p>
              </div>

              {/* Winning Script */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    الرد الفائز المقترح (Winning Talk-Track):
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-primary"
                    onClick={() => handleCopy(activeCard)}
                  >
                    {copiedId === activeCard.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>نسخ الرد</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-3.5 rounded-lg bg-muted/40 border text-xs leading-relaxed font-medium">
                  "{activeCard.winningResponse}"
                </div>
              </div>

              {/* Reversal Question */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold mb-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>سؤال استرجاع السيطرة (Take Back Control):</span>
                </div>
                <p className="text-foreground font-medium">"{activeCard.reversalQuestion}"</p>
              </div>

              {/* Smart Concessions */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-emerald-600" />
                  تنازلات ذكية مقترحة (لا تقلل السعر):
                </span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {activeCard.smartConcessions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                type="button"
                className="w-full gap-2 text-xs font-semibold"
                onClick={() => handleCopy(activeCard)}
              >
                {copiedId === activeCard.id ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>نسخ الرد النموذجي لإرساله في واتساب أو المحادثة</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
