import { describe, it, expect } from "vitest";
import {
  formatLocalizedNotification,
  convertArabicTimeToEnglish,
  convertEnglishTimeToArabic,
  encodeBilingualContent,
} from "../localized-notification";

describe("localized-notification utility", () => {
  it("converts Arabic time to English correctly", () => {
    expect(convertArabicTimeToEnglish("١٢:٤١:١٤ م")).toBe("12:41:14 PM");
    expect(convertArabicTimeToEnglish("٠٩:٠٥:٠٠ ص")).toBe("09:05:00 AM");
  });

  it("converts English time to Arabic correctly", () => {
    expect(convertEnglishTimeToArabic("12:41:14 PM")).toBe("١٢:٤١:١٤ م");
    expect(convertEnglishTimeToArabic("09:05:00 AM")).toBe("٠٩:٠٥:٠٠ ص");
  });

  it("translates test notifications to English when locale is 'en'", () => {
    const rawNotif = {
      title: "Nile Nexus Sales | تجربة الإشعار اللحظي 🔔",
      body: "تم اختبار واستقبال هذا الإشعار اللحظي بنجاح في تمام الساعة (١٢:٤١:١٤ م). النظام يعمل بكفاءة تامة على هاتفك وجهازك.",
    };

    const localized = formatLocalizedNotification(rawNotif, "en");
    expect(localized.title).toBe("🔔 Real-Time Notification Test | Nile Nexus Sales");
    expect(localized.body).toContain("12:41:14 PM");
    expect(localized.body).toContain("This real-time notification was successfully received");
  });

  it("preserves test notifications in Arabic when locale is 'ar'", () => {
    const rawNotif = {
      title: "🔔 تجربة الإشعار اللحظي | Nile Nexus Sales",
      body: "تم اختبار واستقبال هذا الإشعار اللحظي بنجاح في تمام الساعة (١٢:٤١:١٤ م).",
    };

    const localized = formatLocalizedNotification(rawNotif, "ar");
    expect(localized.title).toBe("🔔 تجربة الإشعار اللحظي | Nile Nexus Sales");
    expect(localized.body).toContain("تم اختبار واستقبال هذا الإشعار اللحظي بنجاح");
  });

  it("translates English test notification to Arabic when locale is 'ar'", () => {
    const rawNotif = {
      title: "🔔 Real-Time Notification Test | Nile Nexus Sales",
      body: "This real-time notification was successfully received at (12:41:14 PM).",
    };

    const localized = formatLocalizedNotification(rawNotif, "ar");
    expect(localized.title).toBe("🔔 تجربة الإشعار اللحظي | Nile Nexus Sales");
    expect(localized.body).toContain("١٢:٤١:١٤ م");
  });

  it("handles structured JSON bilingual content", () => {
    const title = encodeBilingualContent("تنبيه تجريبي", "Trial Alert");
    const body = encodeBilingualContent("محتوى عربي", "English content");

    const localizedEn = formatLocalizedNotification({ title, body }, "en");
    expect(localizedEn.title).toBe("Trial Alert");
    expect(localizedEn.body).toBe("English content");

    const localizedAr = formatLocalizedNotification({ title, body }, "ar");
    expect(localizedAr.title).toBe("تنبيه تجريبي");
    expect(localizedAr.body).toBe("محتوى عربي");
  });

  it("translates standard alerts (overdue, proposals) to English", () => {
    const overdue = {
      title: "🚨 تنبيه متابعة متأخرة عاجلة",
      body: "متابعة د. مروة الشاذلي (شركة تبارك) متأخرة منذ يومين. يرجى التواصل العاجل.",
    };
    const localized = formatLocalizedNotification(overdue, "en");
    expect(localized.title).toBe("🚨 Urgent Overdue Follow-up Alert");
    expect(localized.body).toContain("Dr. Marwa El-Shazly");
  });
});
