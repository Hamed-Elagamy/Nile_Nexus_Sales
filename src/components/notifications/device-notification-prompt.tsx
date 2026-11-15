"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { BellRing, X, Smartphone, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/notifications/realtime-notification-provider";

export function DeviceNotificationPrompt() {
  const locale = useLocale() as "ar" | "en";
  const { permission, requestPermission, sendTestNotification } = useNotifications();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    // Only show if browser supports Notification and permission hasn't been granted or denied yet
    if (typeof window !== "undefined" && "Notification" in window) {
      const sessionDismissed = sessionStorage.getItem("tammlo_notif_prompt_dismissed");
      if (Notification.permission === "default" && !sessionDismissed) {
        setIsDismissed(false);
      }
    }
  }, [permission]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tammlo_notif_prompt_dismissed", "true");
    }
  };

  const handleActivate = async () => {
    const perm = await requestPermission();
    if (perm === "granted") {
      setIsDismissed(true);
    }
  };

  const handleTestNow = async () => {
    setIsTesting(true);
    try {
      await sendTestNotification(locale);
    } finally {
      setIsTesting(false);
    }
  };

  if (isDismissed || permission !== "default") {
    return null;
  }

  const isEn = locale === "en";

  return (
    <div className="relative isolate z-30 bg-gradient-to-r from-amber-500/15 via-primary/15 to-blue-500/15 border-b border-amber-500/30 dark:border-amber-400/20 px-3 py-2.5 transition-all animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-2xs">
            <BellRing className="h-4 w-4 animate-bounce" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">
              {isEn
                ? "Enable live device notifications for Tammlo Sales"
                : "فعّل إشعارات تامللو اللحظية على جهازك وهاتفك"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {isEn
                ? "Receive instant alerts for new leads, won deals, and scheduled follow-ups."
                : "لتصلك تنبيهات حية فورية ومباشرة عند تسجيل عملاء جدد أو إغلاق الصفقات أو المتابعات."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            onClick={handleActivate}
            className="h-8 px-3 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{isEn ? "Enable Notifications" : "تفعيل الإشعارات الآن"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5 me-1" />
            <span>{isEn ? "Later" : "لاحقاً"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
