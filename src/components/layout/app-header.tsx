"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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

        {/* Actions */}
        <div className="flex items-center gap-2 ms-4">
          <LanguageSwitcher />

          <button
            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors relative"
            aria-label={t("nav.notifications")}
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 ms-2 ps-2 border-s border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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
