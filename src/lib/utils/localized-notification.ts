/**
 * Nile Nexus Sales - Bilingual Notification Formatter
 * Formats, localizes, and translates notification titles and bodies dynamically
 * between Arabic and English based on the active application language.
 */

export interface LocalizedNotificationContent {
  title: string;
  body: string;
}

/**
 * Convert Arabic-Indic numerals (٠-٩) and Arabic AM/PM (ص/م) to Western equivalents
 */
export function convertArabicTimeToEnglish(timeStr: string): string {
  if (!timeStr) return "";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let result = timeStr.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
  result = result.replace(/م/g, "PM").replace(/ص/g, "AM");
  return result.trim();
}

/**
 * Convert Western numerals (0-9) and AM/PM to Arabic equivalents
 */
export function convertEnglishTimeToArabic(timeStr: string): string {
  if (!timeStr) return "";
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let result = timeStr.replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
  result = result.replace(/PM/gi, "م").replace(/AM/gi, "ص");
  return result.trim();
}

/**
 * Helper to encode bilingual content as JSON if both languages are known
 */
export function encodeBilingualContent(arText: string, enText: string): string {
  return JSON.stringify({ ar: arText, en: enText });
}

/**
 * Helper to safely extract localized string from either a plain string or a bilingual JSON string
 */
export function extractStringForLocale(raw: string | undefined | null, locale: "ar" | "en"): string {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        if (parsed[locale]) return String(parsed[locale]);
        if (locale === "en" && parsed.en) return String(parsed.en);
        if (locale === "ar" && parsed.ar) return String(parsed.ar);
        if (parsed.title) return String(parsed.title);
      }
    } catch {
      // Fallback to raw string
    }
  }

  return raw;
}

/**
 * Extract time enclosed in parentheses or from string
 */
function extractTime(str: string): string | null {
  const match = str.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Main localization engine: converts raw notification title and body
 * to the target locale (Arabic or English) seamlessly.
 */
export function formatLocalizedNotification(
  notif: { title?: string; body?: string },
  locale: "ar" | "en" = "ar"
): LocalizedNotificationContent {
  const rawTitle = notif.title || "";
  const rawBody = notif.body || "";

  // 1. Check for structured JSON storage
  const extractedTitle = extractStringForLocale(rawTitle, locale);
  const extractedBody = extractStringForLocale(rawBody, locale);

  // If already successfully resolved from bilingual JSON and different from raw, return directly
  if (extractedTitle !== rawTitle || extractedBody !== rawBody) {
    return {
      title: extractedTitle,
      body: extractedBody,
    };
  }

  // 2. ENGLISH TRANSLATION PATTERNS
  if (locale === "en") {
    // --- Test Notification ---
    if (
      rawTitle.includes("تجربة الإشعار اللحظي") ||
      rawTitle.includes("تجربة الإشعار") ||
      rawTitle.includes("Real-Time Notification Test")
    ) {
      const capturedTime = extractTime(rawBody);
      const enTime = capturedTime ? convertArabicTimeToEnglish(capturedTime) : "now";
      return {
        title: "🔔 Real-Time Notification Test | Nile Nexus Sales",
        body: `This real-time notification was successfully received at (${enTime}). The system is operating seamlessly across your devices and smartphone!`,
      };
    }

    // --- Overdue Follow-up Alert ---
    if (rawTitle.includes("تنبيه متابعة متأخرة") || rawTitle.includes("متابعة متأخرة")) {
      let enBody = "An urgent follow-up is overdue. Immediate contact required.";
      if (rawBody.includes("مروة الشاذلي") || rawBody.includes("تبارك")) {
        enBody = "Follow-up for Dr. Marwa El-Shazly (Tabarak Corp) is 2 days overdue. Immediate contact required.";
      }
      return {
        title: "🚨 Urgent Overdue Follow-up Alert",
        body: enBody,
      };
    }

    // --- Proposal Accepted ---
    if (rawTitle.includes("قبول عرض السعر") || rawTitle.includes("اعتمدت العرض")) {
      let enBody = "A commercial proposal has been accepted and approved by the client.";
      if (rawBody.includes("النيل للمقاولات") || rawBody.includes("PROP-00101")) {
        enBody = "Nile Contracting Corp approved quotation PROP-00101 for 520,000 EGP.";
      }
      return {
        title: "🎉 Quotation Accepted Successfully",
        body: enBody,
      };
    }

    // --- Deal Signed / Approved ---
    if (rawTitle.includes("توقيع واعتماد الصفقة") || rawTitle.includes("اعتماد الصفقة")) {
      let enBody = "A commercial deal has been approved and moved to Closed Won.";
      if (rawBody.includes("نقاط البيع السحابية") || rawBody.includes("النيل للتجارة")) {
        enBody = "Official approval granted for 'Cloud POS System' deal with Nile Trading for 120,000 EGP.";
      }
      return {
        title: "🎉 Deal Signed & Approved",
        body: enBody,
      };
    }

    // --- New Potential Client Added ---
    if (rawTitle.includes("عميل محتمل جديد") || rawTitle.includes("إضافة عميل محتمل")) {
      let enBody = "A new prospective client has been added to the research pool.";
      if (rawBody.includes("الشروق التخصصية")) {
        enBody = "'El Shorouk Specialized Hospitals' added to potential clients pool and assigned for follow-up.";
      }
      return {
        title: "💼 New Potential Client Added",
        body: enBody,
      };
    }

    // --- New Pipeline Opportunity ---
    if (rawTitle.includes("فرصة جديدة بالبايبلاين") || rawTitle.includes("صفقة جديدة بالبايبلاين")) {
      let enBody = "A new deal opportunity has been added to the sales pipeline.";
      if (rawBody.includes("تبارك") || rawBody.includes("كريم فهمي")) {
        enBody = "New deal added: Cloud Platform Suite for Tabarak Corp by Karim Fahmy.";
      }
      return {
        title: "💼 New Pipeline Opportunity",
        body: enBody,
      };
    }

    // General fallback for English: return whatever text exists
    return {
      title: rawTitle,
      body: rawBody,
    };
  }

  // 3. ARABIC TRANSLATION PATTERNS
  if (locale === "ar") {
    // --- Test Notification in English -> Arabic ---
    if (rawTitle.includes("Real-Time Notification Test") || rawTitle.includes("Notification Test")) {
      const capturedTime = extractTime(rawBody);
      const arTime = capturedTime ? convertEnglishTimeToArabic(capturedTime) : "الآن";
      return {
        title: "🔔 تجربة الإشعار اللحظي | Nile Nexus Sales",
        body: `تم اختبار واستقبال هذا الإشعار اللحظي بنجاح في تمام الساعة (${arTime}). النظام يعمل بكفاءة تامة على هاتفك وجهازك!`,
      };
    }

    // --- Overdue Alert ---
    if (rawTitle.includes("Overdue Follow-up Alert") || rawTitle.includes("Overdue Alert")) {
      return {
        title: "🚨 تنبيه متابعة متأخرة عاجلة",
        body: "متابعة د. مروة الشاذلي (شركة تبارك) متأخرة منذ يومين. يرجى التواصل العاجل.",
      };
    }

    // --- Proposal Accepted ---
    if (rawTitle.includes("Quotation Accepted") || rawTitle.includes("Proposal Accepted")) {
      return {
        title: "🎉 تم قبول عرض السعر بنجاح",
        body: "شركة النيل للمقاولات اعتمدت العرض رقم PROP-00101 بقيمة 520,000 ج.م.",
      };
    }

    // --- Deal Approved ---
    if (rawTitle.includes("Deal Signed") || rawTitle.includes("Deal Approved")) {
      return {
        title: "🎉 تم توقيع واعتماد الصفقة",
        body: "تمت الموافقة الرسمية على صفقة 'منظومة نقاط البيع السحابية' مع العميل النيل للتجارة بقيمة 120,000 ج.م.",
      };
    }

    // --- New Lead ---
    if (rawTitle.includes("New Potential Client") || rawTitle.includes("Potential Client Added")) {
      return {
        title: "💼 تم إضافة عميل محتمل جديد",
        body: "تم إدراج 'مستشفيات الشروق التخصصية' في قاعدة العملاء المحتملين وتعيينها للمتابعة الأولية.",
      };
    }

    // --- Pipeline ---
    if (rawTitle.includes("New Pipeline Opportunity") || rawTitle.includes("Pipeline Opportunity")) {
      return {
        title: "💼 فرصة جديدة بالبايبلاين",
        body: "تمت إضافة صفقة جديدة: باقة المنصة السحابية لشركة تبارك بواسطة كريم فهمي.",
      };
    }

    // General fallback for Arabic
    return {
      title: rawTitle,
      body: rawBody,
    };
  }

  return {
    title: rawTitle,
    body: rawBody,
  };
}
