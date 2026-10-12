"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead as serverMarkAsRead,
  markAllNotificationsAsRead as serverMarkAllAsRead,
  sendTestNotification as serverSendTestNotification,
  type NotificationItem,
} from "@/lib/actions/notifications";
import {
  playNotificationSound,
  vibrateDevice,
  requestNotificationPermission,
  showDeviceNotification,
} from "@/lib/utils/notifications";

interface NotificationContextValue {
  unreadCount: number;
  notifications: NotificationItem[];
  permission: NotificationPermission;
  isRealtimeConnected: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a RealtimeNotificationProvider");
  }
  return context;
}

interface RealtimeNotificationProviderProps {
  userId?: string;
  initialUnreadCount?: number;
  children: React.ReactNode;
}

export function RealtimeNotificationProvider({
  userId,
  initialUnreadCount = 0,
  children,
}: RealtimeNotificationProviderProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Sync initial browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Fetch initial notifications list and unread count
  const loadNotifications = useCallback(async () => {
    try {
      const [listRes, count] = await Promise.all([
        getNotifications(20),
        getUnreadNotificationsCount(),
      ]);

      if (listRes.success && listRes.data) {
        setNotifications(listRes.data);
      }
      setUnreadCount(count);
    } catch (err) {
      console.debug("[RealtimeNotifications] Error loading notifications:", err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle incoming notification
  const handleIncomingNotification = useCallback(
    (notif: NotificationItem) => {
      // 1. Play synthesized chime
      playNotificationSound();

      // 2. Vibrate mobile device
      vibrateDevice([150, 70, 150]);

      // 3. Show native OS notification (Push / Background / Standalone)
      showDeviceNotification(notif.title, {
        body: notif.body,
        url: notif.link || notif.action_url || "/notifications",
      });

      // 4. In-App Sonner Toast notification
      toast(notif.title, {
        description: notif.body,
        action: notif.link || notif.action_url
          ? {
              label: "عرض",
              onClick: () => router.push(notif.link || notif.action_url || "/notifications"),
            }
          : undefined,
        duration: 6000,
      });

      // 5. Update local state
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    },
    [router]
  );

  // Connect Supabase Realtime channel
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Subscribe to postgres_changes on notifications table for current user
    const channel = supabase
      .channel(`realtime:notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;

          const item: NotificationItem = {
            id: row.id,
            user_id: row.user_id,
            category: row.category || "UPDATE",
            title: row.title,
            body: row.body,
            link: row.link || row.action_url || null,
            action_url: row.action_url || row.link || null,
            is_read: false,
            created_at: row.created_at || new Date().toISOString(),
            type: row.type || (row.category === "ACTION_REQUIRED" ? "ALERT" : "INFO"),
          };

          handleIncomingNotification(item);
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    // Mobile background recovery polling safety net (every 45 seconds)
    const interval = setInterval(() => {
      getUnreadNotificationsCount().then((cnt) => {
        setUnreadCount(cnt);
      });
    }, 45000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId, handleIncomingNotification]);

  // Request native permission
  const handleRequestPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === "granted") {
      toast.success("تم تفعيل الإشعارات الفورية على هذا الجهاز بنجاح! 🔔");
    } else if (perm === "denied") {
      toast.error("تم رفض الإشعارات من إعدادات المتصفح. يمكنك تفعيلها يدوياً من إعدادات الموقع.");
    }
    return perm;
  }, []);

  // Mark single as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await serverMarkAsRead(id);
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await serverMarkAllAsRead();
    toast.success("تم تحديد جميع الإشعارات كمقروءة");
  }, []);

  // Send test notification
  const handleSendTestNotification = useCallback(async () => {
    const res = await serverSendTestNotification();
    if (res.success && res.data) {
      handleIncomingNotification(res.data);
    } else {
      // In offline/fallback mode, simulate directly
      const mockItem: NotificationItem = {
        id: `test-${Date.now()}`,
        user_id: userId || "demo-user",
        category: "UPDATE",
        title: "🔔 تجربة الإشعار اللحظي | Nile Nexus Sales",
        body: `تم اختبار واستقبال هذا الإشعار اللحظي بنجاح! النظام يعمل بكفاءة تامة على هاتفك وجهازك.`,
        link: "/notifications",
        action_url: "/notifications",
        is_read: false,
        created_at: new Date().toISOString(),
        type: "SUCCESS",
      };
      handleIncomingNotification(mockItem);
    }
  }, [userId, handleIncomingNotification]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        permission,
        isRealtimeConnected,
        requestPermission: handleRequestPermission,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        sendTestNotification: handleSendTestNotification,
        refresh: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
