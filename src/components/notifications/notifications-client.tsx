"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCheck,
  AlertCircle,
  CheckCircle,
  Info,
  Radio,
  Sparkles,
  Smartphone,
  BellRing,
  Filter,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/notifications/realtime-notification-provider";
import type { NotificationItem } from "@/lib/actions/notifications";

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const {
    notifications,
    unreadCount,
    permission,
    isRealtimeConnected,
    requestPermission,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"ALL" | "ACTION_REQUIRED" | "UPDATE" | "UNREAD">("ALL");
  const [isTesting, setIsTesting] = useState(false);

  // Use provider notifications if loaded, else fallback to initial
  const displayList = notifications.length > 0 ? notifications : initialNotifications;

  // Filter based on active tab
  const filteredList = displayList.filter((notif) => {
    if (activeTab === "UNREAD") return !notif.is_read;
    if (activeTab === "ACTION_REQUIRED") {
      return notif.category === "ACTION_REQUIRED" || notif.type === "ALERT";
    }
    if (activeTab === "UPDATE") {
      return notif.category === "UPDATE" && notif.type !== "ALERT";
    }
    return true;
  });

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await sendTestNotification();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <span>{t("title")}</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
                {unreadCount} {t("unreadBadge")}
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 border-dashed"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{t("testBtn")}</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>{t("markAllRead")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Device & Real-Time Sync Status Banner */}
      <div className="p-4 rounded-2xl border bg-gradient-to-r from-blue-500/10 via-primary/5 to-cyan-500/10 border-blue-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
            <BellRing className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                {t("realtimeStatusTitle")}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>{t("realtimeConnected")}</span>
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {permission === "granted"
                ? t("pushActiveDesc")
                : t("pushInactiveDesc")}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {permission !== "granted" ? (
            <Button
              size="sm"
              onClick={() => requestPermission()}
              className="w-full md:w-auto text-xs font-semibold shadow-xs"
            >
              <Smartphone className="h-3.5 w-3.5 me-1.5" />
              <span>{t("enableDevicePushBtn")}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Check className="h-4 w-4" />
              <span>{t("deviceActive")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--muted)]/60 rounded-xl max-w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("tabAll")} ({displayList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "UNREAD"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("tabUnread")} ({displayList.filter((n) => !n.is_read).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ACTION_REQUIRED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "ACTION_REQUIRED"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("tabActionRequired")}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("UPDATE")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "UPDATE"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("tabUpdates")}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-2xl bg-[var(--card)]/40 text-[var(--muted-foreground)] text-sm space-y-3">
            <div className="h-12 w-12 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
              <Filter className="h-6 w-6 stroke-1" />
            </div>
            <p className="font-medium">{t("empty")}</p>
          </div>
        ) : (
          filteredList.map((notif) => {
            const timeStr = new Date(notif.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const isAlert = notif.category === "ACTION_REQUIRED" || notif.type === "ALERT";
            const isSuccess = notif.type === "SUCCESS";

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  notif.is_read
                    ? "border-[var(--border)] bg-[var(--card)] opacity-85"
                    : "border-primary/40 bg-[var(--card)] shadow-xs ring-1 ring-primary/20"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isAlert ? (
                    <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  ) : isSuccess ? (
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <Info className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-bold text-sm text-[var(--foreground)] truncate">
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                      {timeStr}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {notif.body}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border)]/50">
                    <div>
                      {(notif.action_url || notif.link) && (
                        <Link
                          href={notif.action_url || notif.link || "/notifications"}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                          }}
                          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>{tCommon("details")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--muted)] transition-colors cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>{t("markAsRead")}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
