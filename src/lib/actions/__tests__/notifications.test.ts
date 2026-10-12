import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  sendTestNotification,
} from "../notifications";

// Mock Supabase config to simulate offline/demo mode by default
vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe("Notifications Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches notifications in fallback mode", async () => {
    const res = await getNotifications();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data!.length).toBeGreaterThan(0);
    expect(res.data![0]).toHaveProperty("title");
    expect(res.data![0]).toHaveProperty("category");
  });

  it("fetches unread notifications count in fallback mode", async () => {
    const count = await getUnreadNotificationsCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("marks a notification as read successfully", async () => {
    const res = await markNotificationAsRead("demo-notif-1");
    expect(res.success).toBe(true);
  });

  it("marks all notifications as read successfully", async () => {
    const res = await markAllNotificationsAsRead();
    expect(res.success).toBe(true);
  });

  it("creates a new notification with proper attributes", async () => {
    const res = await createNotification({
      userId: "test-user-id",
      title: "صفقة جديدة معتمدة",
      body: "تم اعتماد صفقة تطبيق نيل نيكسس بنجاح.",
      category: "UPDATE",
      type: "SUCCESS",
      link: "/deals/123",
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data!.title).toBe("صفقة جديدة معتمدة");
    expect(res.data!.category).toBe("UPDATE");
    expect(res.data!.link).toBe("/deals/123");
  });

  it("triggers test notification correctly", async () => {
    const res = await sendTestNotification();
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data!.title).toContain("تجربة الإشعار اللحظي");
  });
});
