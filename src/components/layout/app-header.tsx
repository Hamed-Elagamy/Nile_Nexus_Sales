"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Search, Database, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showDbInfo, setShowDbInfo] = useState(false);

  const isConfigured = typeof window !== "undefined" ? isSupabaseConfigured() : false;

  const handleSignOut = async () => {
    if (isConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    } else {
      document.cookie = "nile_demo_signed_out=true; path=/; max-age=86400";
    }
    router.push("/login");
    router.refresh();
  };

  const displayName = user.user_metadata?.full_name || user.email;
  const userRole = user.user_metadata?.role || "GM";

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-full ps-10 pe-4 py-2 rounded-lg bg-[var(--muted)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
            />
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-2 ms-4">
          {/* Database Mode Indicator */}
          {!isConfigured ? (
            <button
              onClick={() => setShowDbInfo(!showDbInfo)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Database className="h-3.5 w-3.5" />
              <span>{t("common.appName") ? (t("common.save") === "حفظ" ? "وضع المعاينة التجريبي (Demo)" : "Demo Preview Mode") : "Demo Mode"}</span>
            </button>
          ) : (
            <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("common.save") === "حفظ" ? "Supabase متصل" : "Supabase Connected"}</span>
            </span>
          )}

          <LanguageSwitcher />

          <Link
            href="/notifications"
            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors relative"
            aria-label={t("nav.notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </Link>

          <div className="hidden md:flex items-center gap-2 ms-2 ps-2 border-s border-[var(--border)]">
            <div className="flex flex-col text-end">
              <span className="text-xs font-medium text-[var(--foreground)]">
                {displayName}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label={t("auth.logout")}
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showDbInfo && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <p>
            💡 <strong>النظام يعمل الآن في وضع المعاينة بكامل المميزات:</strong> لتوصيل قاعدة بيانات Supabase الحية، أضف المفاتيح إلى ملف <code>.env.local</code> وشغّل ملفات الهجرة في <code>supabase/migrations/</code>.
          </p>
          <button
            onClick={() => setShowDbInfo(false)}
            className="text-xs font-bold underline ms-2 hover:opacity-80"
          >
            إغلاق
          </button>
        </div>
      )}
    </header>
  );
}
