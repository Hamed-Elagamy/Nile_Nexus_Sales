"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  CheckCircle,
  Info,
  Radio,
  ExternalLink,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/components/notifications/realtime-notification-provider";
import { formatLocalizedNotification } from "@/lib/utils/localized-notification";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const tNav = useTranslations("nav");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const {
    unreadCount,
    notifications,
    permission,
    isRealtimeConnected,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    sendTestNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notifId: string, url?: string | null) => {
    await markAsRead(notifId);
    setIsOpen(false);
    if (url) {
      router.push(url);
    } else {
      router.push("/notifications");
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors relative cursor-pointer"
        aria-label={tNav("notifications")}
        title={tNav("notifications")}
      >
        <Bell className="h-5 w-5" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 ? (
          <>
            <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-red-500 animate-ping opacity-60 pointer-events-none" />
          </>
        ) : (
          isRealtimeConnected && (
            <span
              className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-emerald-500"
              title="متصل لحظياً (Live Realtime Connected)"
            />
          )
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--border)] bg-[var(--muted)]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[var(--foreground)]">
                {t("title")}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {unreadCount} {t("unreadBadge")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded hover:bg-[var(--muted)] flex items-center gap-1 transition-colors cursor-pointer"
                  title={t("markAllRead")}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("markAllRead")}</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAllNotifications()}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                  title={t("clearAll")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("clearAll")}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Realtime Permission Prompt if not granted */}
          {permission !== "granted" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Radio className="h-4 w-4 shrink-0 text-blue-600 animate-pulse" />
                <span>{t("activateOnThisDevice")}</span>
              </div>
              <button
                type="button"
                onClick={() => requestPermission()}
                className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                {t("enableBtn")}
              </button>
            </div>
          )}

          {/* Notifications Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)] space-y-2">
                <Bell className="h-8 w-8 mx-auto stroke-1 opacity-40" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const localized = formatLocalizedNotification(notif, locale);
                const timeStr = new Date(notif.created_at).toLocaleTimeString(
                  locale === "en" ? "en-US" : "ar-EG",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.link || notif.action_url)}
                    className={`p-3 text-start hover:bg-[var(--muted)]/50 transition-colors flex items-start gap-3 cursor-pointer ${
                      !notif.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {notif.type === "ALERT" || notif.category === "ACTION_REQUIRED" ? (
                        <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      ) : notif.type === "SUCCESS" ? (
                        <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Info className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[var(--foreground)] truncate">
                          {localized.title}
                        </h4>
                        <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                          {timeStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {localized.body}
                      </p>
                    </div>

                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                sendTestNotification();
              }}
              className="text-[11px] text-[var(--muted-foreground)] hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--muted)] transition-colors cursor-pointer"
              title={t("testNotificationTooltip")}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{t("testBtn")}</span>
            </button>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--muted)] transition-colors"
            >
              <span>{t("viewAll")}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
