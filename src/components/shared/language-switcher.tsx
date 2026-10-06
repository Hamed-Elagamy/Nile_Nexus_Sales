"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { setUserLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const changeLocale = (targetLocale: Locale) => {
    if (targetLocale === locale) return;
    startTransition(async () => {
      await setUserLocale(targetLocale);
      document.cookie = `nile-nexus-locale=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--muted)]/60 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => changeLocale("ar")}
        disabled={isPending}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all cursor-pointer",
          locale === "ar"
            ? "bg-[var(--background)] text-[var(--foreground)] font-bold shadow-xs"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => changeLocale("en")}
        disabled={isPending}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all cursor-pointer",
          locale === "en"
            ? "bg-[var(--background)] text-[var(--foreground)] font-bold shadow-xs"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
      >
        English
      </button>
    </div>
  );
}
