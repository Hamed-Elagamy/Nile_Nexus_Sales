"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserLocale } from "@/i18n/locale";
import type { Notification, NotificationCategory } from "@/types/domain";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NotificationItem extends Notification {
  type?: string;
  action_url?: string | null;
}

/**
 * Fetch notifications for current user
 */
export async function getNotifications(limit = 50): Promise<ActionResult<NotificationItem[]>> {
  try {
    if (!isSupabaseConfigured()) {
      // In offline/demo mode, return simulated in-memory sample notifications
      const demoData: NotificationItem[] = [
        {
          id: "demo-notif-1",
          user_id: "demo-user",
          category: "ACTION_REQUIRED",
          title: "🚨 تنبيه متابعة متأخرة عاجلة",
          body: "متابعة د. مروة الشاذلي (شركة تبارك) متأخرة منذ يومين. يرجى التواصل العاجل.",
          link: "/follow-ups",
          action_url: "/follow-ups",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: "ALERT",
        },
        {
          id: "demo-notif-2",
          user_id: "demo-user",
          category: "UPDATE",
          title: "🎉 تم توقيع واعتماد الصفقة",
          body: "تمت الموافقة الرسمية على صفقة 'منظومة نقاط البيع السحابية' مع العميل النيل للتجارة بقيمة 120,000 ج.م.",
          link: "/deals",
          action_url: "/deals",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          type: "SUCCESS",
        },
        {
          id: "demo-notif-3",
          user_id: "demo-user",
          category: "UPDATE",
          title: "💼 تم إضافة عميل محتمل جديد",
          body: "تم إدراج 'مستشفيات الشروق التخصصية' في قاعدة العملاء المحتملين وتعيينها للمتابعة الأولية.",
          link: "/potential-clients",
          action_url: "/potential-clients",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          type: "INFO",
        },
      ];
      return { success: true, data: demoData };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getNotifications] Error:", error.message);
      return { success: false, error: error.message };
    }

    const items: NotificationItem[] = (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      category: (row.category || (row.type === "ALERT" ? "ACTION_REQUIRED" : "UPDATE")) as NotificationCategory,
      title: row.title,
      body: row.body,
      link: row.link || row.action_url || null,
      action_url: row.action_url || row.link || null,
      is_read: Boolean(row.is_read),
      created_at: row.created_at,
      type: row.type || (row.category === "ACTION_REQUIRED" ? "ALERT" : "INFO"),
    }));

    return { success: true, data: items };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load notifications";
    return { success: false, error: message };
  }
}

/**
 * Get unread notifications count for current user
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    if (!isSupabaseConfigured()) {
      return 2;
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.warn("[getUnreadNotificationsCount] Error:", error.message);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error marking notification as read";
    return { success: false, error: msg };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error marking all as read";
    return { success: false, error: msg };
  }
}

/**
 * Insert a new notification for a specific user
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  category?: NotificationCategory;
  link?: string;
  type?: "ALERT" | "INFO" | "SUCCESS";
}): Promise<ActionResult<NotificationItem>> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        data: {
          id: `demo-${Date.now()}`,
          user_id: params.userId,
          title: params.title,
          body: params.body,
          category: params.category || "UPDATE",
          link: params.link || null,
          is_read: false,
          created_at: new Date().toISOString(),
          type: params.type || "INFO",
        },
      };
    }

    const supabase = await createSupabaseServerClient();
    const category = params.category || (params.type === "ALERT" ? "ACTION_REQUIRED" : "UPDATE");
    const link = params.link || null;

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: params.userId,
        title: params.title,
        body: params.body,
        category,
        link,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[createNotification] Error:", error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        category: data.category,
        title: data.title,
        body: data.body,
        link: data.link,
        action_url: data.link,
        is_read: data.is_read,
        created_at: data.created_at,
        type: params.type || (data.category === "ACTION_REQUIRED" ? "ALERT" : "INFO"),
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error creating notification";
    return { success: false, error: msg };
  }
}

/**
 * Send a live test notification to the current logged-in user in their preferred language
 */
export async function sendTestNotification(targetLocale?: "ar" | "en"): Promise<ActionResult<NotificationItem>> {
  try {
    let userId = "demo-user";

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createSupabaseServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {
        // Fallback to demo-user if outside request context
      }
    }

    let activeLocale = targetLocale;
    if (!activeLocale) {
      try {
        const userLoc = await getUserLocale();
        if (userLoc === "en" || userLoc === "ar") {
          activeLocale = userLoc;
        }
      } catch {
        activeLocale = "ar";
      }
    }
    activeLocale = activeLocale || "ar";

    const isEn = activeLocale === "en";
    const nowStr = isEn
      ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const title = isEn
      ? "🔔 Real-Time Notification Test | Nile Nexus Sales"
      : "🔔 تجربة الإشعار اللحظي | Nile Nexus Sales";

    const body = isEn
      ? `This real-time notification was successfully tested and received at (${nowStr}). The system is operating seamlessly across your devices and smartphone!`
      : `تم اختبار واستقبال هذا الإشعار اللحظي بنجاح في تمام الساعة (${nowStr}). النظام يعمل بكفاءة تامة على هاتفك وجهازك!`;

    return await createNotification({
      userId,
      title,
      body,
      category: "UPDATE",
      type: "SUCCESS",
      link: "/notifications",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to trigger test notification";
    return { success: false, error: msg };
  }
}
