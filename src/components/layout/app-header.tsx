"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Search, CheckCircle2, Menu, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { NotificationBell } from "./notification-bell";
import { useMobileNav } from "./mobile-nav-context";
import { triggerPwaInstall } from "@/components/pwa/pwa-install-prompt";
import { ThemeAccentPicker } from "@/components/theme/theme-accent-picker";
import { LiveActivityTicker } from "@/components/layout/live-activity-ticker";
import { useSalesTools } from "@/components/shared/sales-tools-manager";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const mobileNav = useMobileNav();
  const { openCommandPalette } = useSalesTools();

  const isConfigured = isSupabaseConfigured();

  const handleSignOut = async () => {
    if (isConfigured) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore sign out errors
      }
    }
    document.cookie = "nile_demo_signed_out=true; path=/; max-age=86400";
    document.cookie = "nile_demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  const displayName = user.user_metadata?.full_name || user.email;
  const userRole = user.user_metadata?.role || "GM";

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6 gap-2">
        {/* Left side: Mobile menu toggle + Command Search */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={mobileNav.toggle}
            className="md:hidden p-2 -ms-1 rounded-lg hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors cursor-pointer shrink-0"
            aria-label={t("nav.menu")}
            title={t("nav.menu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={openCommandPalette}
            className="relative w-36 sm:w-48 md:w-56 lg:w-64 flex items-center justify-between ps-8 pe-2 sm:ps-9 sm:pe-2.5 py-1.5 sm:py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs sm:text-sm text-muted-foreground border border-border/50 hover:border-border transition-all cursor-pointer text-start group shadow-2xs shrink-0"
            title="فتح شريط الأوامر والبحث الشامل (Ctrl + K)"
          >
            <Search className="absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate min-w-0 pe-1.5">{t("common.search")}...</span>
            <kbd className="hidden md:inline-flex shrink-0 items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Center: Live Team Activity Ticker */}
        <LiveActivityTicker />

        {/* Actions & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 ms-auto">
          {/* Live Database Status Indicator */}
          {isConfigured && (
            <span className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("common.supabaseConnected")}</span>
            </span>
          )}

          {/* Quick Install Button (Windows PC, Android, iOS) */}
          <button
            type="button"
            onClick={() => triggerPwaInstall()}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-all cursor-pointer shadow-2xs"
            title={t("nav.installApp")}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("nav.installApp")}</span>
          </button>

          {/* Theme Palette & Sound Customizer */}
          <ThemeAccentPicker />

          <LanguageSwitcher />

          <NotificationBell />

          <div className="hidden md:flex items-center gap-2 ms-2 ps-2 border-s border-[var(--border)]">
            <Link
              href="/settings"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title={t("common.profileAndSettings")}
            >
              {user.user_metadata?.avatar_url ? (
                <div className="h-7 w-7 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex flex-col text-end">
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {displayName}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {userRole}
                </span>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label={t("auth.logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
