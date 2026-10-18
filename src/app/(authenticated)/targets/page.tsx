import React from "react";
import { CommissionQuotaSimulator, SalesRepPerformance } from "@/components/sales/commission-quota-simulator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "أهداف المبيعات والعمولات | Nile Nexus Sales",
  description: "محاكي أهداف المبيعات والعمولات التفاعلي لفريق المبيعات",
};

export default async function TargetsPage() {
  const t = await getTranslations("targets");
  const tNav = await getTranslations("nav");

  const supabase = await createClient();

  // Query real active profiles from database
  const { data: dbProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  // Query closed won deals to aggregate real rep achievement
  const { data: dbWonDeals } = await supabase
    .from("deals")
    .select("sales_owner_id, final_value, estimated_value")
    .eq("stage", "WON")
    .is("archived_at", null);

  const wonMap: Record<string, number> = {};
  if (dbWonDeals) {
    for (const d of dbWonDeals) {
      if (d.sales_owner_id) {
        const val = Number(d.final_value ?? d.estimated_value ?? 0);
        wonMap[d.sales_owner_id] = (wonMap[d.sales_owner_id] || 0) + val;
      }
    }
  }

  // Pre-configured mappings for real enterprise team members
  const MEMBER_METADATA: Record<string, { name_ar: string; name_en: string; avatar_ar: string; avatar_en: string; quota: number }> = {
    "hamedelagamy00@gmail.com": {
      name_ar: "محمد حامد",
      name_en: "Mohamed Hamed",
      avatar_ar: "م.ح",
      avatar_en: "MH",
      quota: 250000,
    },
    "ezzreem726@gmail.com": {
      name_ar: "ريم عز",
      name_en: "Reem Ezz",
      avatar_ar: "ر.ع",
      avatar_en: "RE",
      quota: 250000,
    },
    "fnesma54@gmail.com": {
      name_ar: "نسمة فتحي",
      name_en: "Nesma Fathy",
      avatar_ar: "ن.ف",
      avatar_en: "NF",
      quota: 200000,
    },
    "ofawzy952@gmail.com": {
      name_ar: "عمر الباجوري",
      name_en: "Omar El Bagoury",
      avatar_ar: "ع.ب",
      avatar_en: "OB",
      quota: 200000,
    },
    "rihamelsayedelsayed@gmail.com": {
      name_ar: "ريهام السيد",
      name_en: "Riham ELSayed",
      avatar_ar: "ر.س",
      avatar_en: "RE",
      quota: 200000,
    },
    "za325961@gmail.com": {
      name_ar: "زينب أحمد",
      name_en: "Zeinab Ahmed",
      avatar_ar: "ز.أ",
      avatar_en: "ZA",
      quota: 200000,
    },
  };

  const ROLE_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
    GM: { ar: "المدير العام", en: "General Manager" },
    ADMIN: { ar: "مدير النظام", en: "System Administrator" },
    SALES: { ar: "مسؤول مبيعات", en: "Sales Representative" },
  };

  let initialReps: SalesRepPerformance[] = [];

  if (dbProfiles && dbProfiles.length > 0) {
    initialReps = dbProfiles.map((p) => {
      const emailLower = (p.email || "").toLowerCase();
      const meta = MEMBER_METADATA[emailLower];
      const roleTrans = ROLE_TRANSLATIONS[p.role] || { ar: p.role, en: p.role };
      const won = wonMap[p.id] || 0;

      return {
        id: p.id,
        name_ar: meta?.name_ar || p.full_name,
        name_en: meta?.name_en || p.full_name,
        role_ar: roleTrans.ar,
        role_en: roleTrans.en,
        quota: meta?.quota || 200000,
        won,
        avatar_ar: meta?.avatar_ar || (p.full_name ? p.full_name.slice(0, 2) : "ف.ع"),
        avatar_en: meta?.avatar_en || (p.full_name ? p.full_name.slice(0, 2).toUpperCase() : "TM"),
      };
    });
  } else {
    // Clean fallback to real company team members starting with 0 won
    initialReps = [
      { id: "1", name_ar: "محمد حامد", name_en: "Mohamed Hamed", role_ar: "المدير العام", role_en: "General Manager", quota: 250000, won: 0, avatar_ar: "م.ح", avatar_en: "MH" },
      { id: "2", name_ar: "ريم عز", name_en: "Reem Ezz", role_ar: "المدير العام", role_en: "General Manager", quota: 250000, won: 0, avatar_ar: "ر.ع", avatar_en: "RE" },
      { id: "3", name_ar: "نسمة فتحي", name_en: "Nesma Fathy", role_ar: "مدير النظام", role_en: "System Administrator", quota: 200000, won: 0, avatar_ar: "ن.ف", avatar_en: "NF" },
      { id: "4", name_ar: "عمر الباجوري", name_en: "Omar El Bagoury", role_ar: "مسؤول مبيعات", role_en: "Sales Representative", quota: 200000, won: 0, avatar_ar: "ع.ب", avatar_en: "OB" },
      { id: "5", name_ar: "ريهام السيد", name_en: "Riham ELSayed", role_ar: "مسؤول مبيعات", role_en: "Sales Representative", quota: 200000, won: 0, avatar_ar: "ر.س", avatar_en: "RE" },
      { id: "6", name_ar: "زينب أحمد", name_en: "Zeinab Ahmed", role_ar: "مسؤول مبيعات", role_en: "Sales Representative", quota: 200000, won: 0, avatar_ar: "ز.أ", avatar_en: "ZA" },
    ];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{tNav("dashboard")}</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-primary">{t("breadcrumb")}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <CommissionQuotaSimulator initialReps={initialReps} />
    </div>
  );
}
