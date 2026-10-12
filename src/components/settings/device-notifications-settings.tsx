"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Smartphone,
  BellRing,
  Sparkles,
  Download,
  CheckCircle2,
  Radio,
  Volume2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/notifications/realtime-notification-provider";
import { triggerPwaInstall } from "@/components/pwa/pwa-install-prompt";

export function DeviceNotificationsSettings() {
  const t = useTranslations("notifications");
  const tPwa = useTranslations("pwa");
  const locale = useLocale() as "ar" | "en";
  const {
    permission,
    isRealtimeConnected,
    requestPermission,
    sendTestNotification,
  } = useNotifications();

  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await sendTestNotification(locale);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-[var(--border)] shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          <span>{t("realtimeStatusTitle")}</span>
        </CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-Time WebSocket & Push Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>اتصال السيرفر اللحظي (Realtime)</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                {t("realtimeConnected")}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              تلقي تحديثات الصفقات والمتابعات فور حفظها على السيرفر مباشرة دون الحاجة لتحديث الصفحة.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-blue-500" />
                <span>إشعارات الجهاز والصوت</span>
              </span>
              {permission === "granted" ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("deviceActive")}</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10">
                  غير مفعلة
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {permission === "granted" ? t("pushActiveDesc") : t("pushInactiveDesc")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {permission !== "granted" && (
            <Button
              size="sm"
              onClick={() => requestPermission()}
              className="text-xs font-semibold"
            >
              <BellRing className="h-4 w-4 me-1.5" />
              <span>{t("enableDevicePushBtn")}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="text-xs font-semibold border-dashed"
          >
            <Sparkles className="h-4 w-4 text-amber-500 me-1.5" />
            <span>{t("testBtn")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerPwaInstall()}
            className="text-xs font-semibold"
          >
            <Download className="h-4 w-4 text-primary me-1.5" />
            <span>{tPwa("installBtn")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
