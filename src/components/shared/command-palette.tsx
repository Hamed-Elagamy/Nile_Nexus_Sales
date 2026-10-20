"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Briefcase,
  Layers,
  Calculator,
  FileText,
  Copy,
  PlusCircle,
  X,
  ExternalLink,
  TrendingUp,
  ShieldAlert,
  Upload,
  MessageSquare,
  Coffee,
} from "lucide-react";
import { demoServices } from "@/lib/demo-data";
import { sounds } from "@/lib/utils/confetti-sound";

interface CommandItem {
  id: string;
  category: "أدوات وإجراءات سريعة" | "صفحات النظام" | "كتالوج الخدمات (173 خدمة)";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenVatCalculator?: () => void;
  onOpenScratchpad?: () => void;
  onOpenSnippets?: () => void;
  onOpenEstimator?: () => void;
  onOpenRoiCalculator?: () => void;
  onOpenBattlecards?: () => void;
  onOpenBulkImport?: () => void;
  onOpenWhatsAppSequences?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenVatCalculator,
  onOpenScratchpad,
  onOpenSnippets,
  onOpenEstimator,
  onOpenRoiCalculator,
  onOpenBattlecards,
  onOpenBulkImport,
  onOpenWhatsAppSequences,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Quick Tools & Actions
      {
        id: "action-coffex-lead",
        category: "أدوات وإجراءات سريعة",
        title: "تسجيل عميل كوفيكس ميداني",
        subtitle: "نموذج تسجيل سريع لكافيهات ومحامص القهوة مع التقاط الموقع GPS",
        icon: <Coffee className="h-4 w-4 text-primary" />,
        action: () => {
          router.push("/coffex");
          onOpenChange(false);
        },
        badge: "كوفيكس",
      },
      {
        id: "action-add-lead",
        category: "أدوات وإجراءات سريعة",
        title: "إضافة عميل محتمل جديد (Lead)",
        subtitle: "تسجيل فرصة تجارية جديدة في الحوض",
        icon: <PlusCircle className="h-4 w-4 text-primary" />,
        action: () => {
          router.push("/potential-clients");
          onOpenChange(false);
        },
        badge: "إجراء",
      },
      {
        id: "action-new-proposal",
        category: "أدوات وإجراءات سريعة",
        title: "إنشاء عرض سعر رسمي جديد (Quotation)",
        subtitle: "تحديد الخدمات وحساب البنود والدفعات",
        icon: <FileText className="h-4 w-4 text-emerald-600" />,
        action: () => {
          router.push("/proposals/new");
          onOpenChange(false);
        },
        badge: "عرض جديد",
      },
      {
        id: "action-calc",
        category: "أدوات وإجراءات سريعة",
        title: "حاسبة الضرائب 14% والأقساط الفورية",
        subtitle: "حساب ضريبة القيمة المضافة وتقسيم الدفعات",
        icon: <Calculator className="h-4 w-4 text-amber-600" />,
        action: () => {
          onOpenChange(false);
          onOpenVatCalculator?.();
        },
        badge: "حاسبة",
      },
      {
        id: "action-scratchpad",
        category: "أدوات وإجراءات سريعة",
        title: "المفكرة وملاحظات المبيعات السريعة",
        subtitle: "تدوين أرقام وملاحظات هاتفية سريعة",
        icon: <FileText className="h-4 w-4 text-indigo-600" />,
        action: () => {
          onOpenChange(false);
          onOpenScratchpad?.();
        },
        badge: "نوتة",
      },
      {
        id: "action-snippets",
        category: "أدوات وإجراءات سريعة",
        title: "بنك الحسابات والنصوص للنسخ السريع",
        subtitle: "بيانات البنك، InstaPay، السجل التجاري، المقر",
        icon: <Copy className="h-4 w-4 text-teal-600" />,
        action: () => {
          onOpenChange(false);
          onOpenSnippets?.();
        },
        badge: "نسخ",
      },
      {
        id: "action-estimator",
        category: "أدوات وإجراءات سريعة",
        title: "حاسبة نطاق وتكلفة المشاريع (Scope & Tech Estimator)",
        subtitle: "حساب أيام العمل، التكاليف المباشرة، وهامش الربح",
        icon: <Calculator className="h-4 w-4 text-primary" />,
        action: () => {
          onOpenChange(false);
          onOpenEstimator?.();
        },
        badge: "تسعير",
      },
      {
        id: "action-roi",
        category: "أدوات وإجراءات سريعة",
        title: "حاسبة العائد الاستثماري للعميل (Software ROI)",
        subtitle: "حساب الوفر المالي وفترة الاسترداد ونسبة الربحية",
        icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
        action: () => {
          onOpenChange(false);
          onOpenRoiCalculator?.();
        },
        badge: "جدوى",
      },
      {
        id: "action-battlecards",
        category: "أدوات وإجراءات سريعة",
        title: "دليل الرد على اعتراضات العملاء (Objection Buster)",
        subtitle: "بطاقات مواجهة غلاء السعر والمنافسين والتأجيل",
        icon: <ShieldAlert className="h-4 w-4 text-amber-600" />,
        action: () => {
          onOpenChange(false);
          onOpenBattlecards?.();
        },
        badge: "تكتيكات",
      },
      {
        id: "action-bulk-import",
        category: "أدوات وإجراءات سريعة",
        title: "استيراد العملاء المحتملين من إكسيل (Bulk CSV)",
        subtitle: "رفع شيت إكسيل مع كشف تلقائي للأرقام المكررة",
        icon: <Upload className="h-4 w-4 text-blue-600" />,
        action: () => {
          onOpenChange(false);
          onOpenBulkImport?.();
        },
        badge: "استيراد",
      },
      {
        id: "action-wa-sequences",
        category: "أدوات وإجراءات سريعة",
        title: "سلاسل رسائل الواتساب المتتابعة (WhatsApp Sequences)",
        subtitle: "قوالب حملات متابعة تسلسلية ذكية لزيادة معدل الردود",
        icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
        action: () => {
          onOpenChange(false);
          onOpenWhatsAppSequences?.();
        },
        badge: "واتساب",
      },

      // Core Pages
      {
        id: "nav-coffex",
        category: "صفحات النظام",
        title: "كوفيكس للمبيعات الميدانية",
        subtitle: "نموذج تسجيل العملاء الميداني وسجل زيارات الكافيهات",
        icon: <Coffee className="h-4 w-4 text-primary" />,
        action: () => {
          router.push("/coffex");
          onOpenChange(false);
        },
      },
      {
        id: "nav-potential",
        category: "صفحات النظام",
        title: "العملاء المحتملين (Research Pool)",
        subtitle: "قائمة العملاء قيد الاستكشاف والتأهيل",
        icon: <Users className="h-4 w-4 text-blue-600" />,
        action: () => {
          router.push("/potential-clients");
          onOpenChange(false);
        },
      },
      {
        id: "nav-clients",
        category: "صفحات النظام",
        title: "دليل العملاء المؤكدين (Clients)",
        subtitle: "إدارة الشركات وجهات الاتصال",
        icon: <Users className="h-4 w-4 text-violet-600" />,
        action: () => {
          router.push("/clients");
          onOpenChange(false);
        },
      },
      {
        id: "nav-pipeline",
        category: "صفحات النظام",
        title: "مسار المبيعات التفاعلي (Pipeline Kanban)",
        subtitle: "لوحة سحب وإفلات مراحل الصفقات",
        icon: <Layers className="h-4 w-4 text-emerald-600" />,
        action: () => {
          router.push("/pipeline");
          onOpenChange(false);
        },
      },
      {
        id: "nav-deals",
        category: "صفحات النظام",
        title: "الصفقات التجارية (Deals)",
        subtitle: "جدول كافة الصفقات المفتوحة والمغلقة",
        icon: <Briefcase className="h-4 w-4 text-amber-600" />,
        action: () => {
          router.push("/deals");
          onOpenChange(false);
        },
      },
      {
        id: "nav-services",
        category: "صفحات النظام",
        title: "كتالوج الـ 173 خدمة برمجية (Services)",
        subtitle: "أسعار ومواصفات مشاريع البرمجيات والتطبيقات",
        icon: <Layers className="h-4 w-4 text-cyan-600" />,
        action: () => {
          router.push("/services");
          onOpenChange(false);
        },
      },
    ];

    // Append services from catalog for live instant search
    demoServices.slice(0, 30).forEach((srv) => {
      const priceText = srv.internal_reference_price
        ? `${Number(srv.internal_reference_price).toLocaleString("ar-EG")} ج.م`
        : "حسب النطاق";
      list.push({
        id: `srv-${srv.id}`,
        category: "كتالوج الخدمات (173 خدمة)",
        title: srv.name_ar,
        subtitle: `${srv.name_en} • تسعير استرشادي: ${priceText}`,
        icon: <ExternalLink className="h-4 w-4 text-primary" />,
        action: () => {
          router.push(`/services?search=${encodeURIComponent(srv.name_ar)}`);
          onOpenChange(false);
        },
        badge: priceText,
      });
    });

    return list;
  }, [
    router,
    onOpenChange,
    onOpenVatCalculator,
    onOpenScratchpad,
    onOpenSnippets,
    onOpenEstimator,
    onOpenRoiCalculator,
    onOpenBattlecards,
    onOpenBulkImport,
    onOpenWhatsAppSequences,
  ]);

  // Filtered by query
  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 15);
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleSelect = (item: CommandItem) => {
    sounds.playTactileClick();
    item.action();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/30">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن صفحة، أو خدمة برمجية، أو أداة سريعة... (Ctrl + K)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hidden sm:inline">
            ESC للإغلاق
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة لـ &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-background border border-border/60 shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate text-foreground">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 ms-2">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>انقر أو اضغط Enter للتنفيذ</span>
          <div className="flex items-center gap-2">
            <span>Nile Nexus Sales Copilot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
