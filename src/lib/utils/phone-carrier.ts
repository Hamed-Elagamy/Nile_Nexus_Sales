/**
 * Egyptian & Gulf Mobile Carrier Detection Utility
 * Nile Nexus Sales - Instant phone intelligence
 */

export interface PhoneCarrierInfo {
  carrier: "vodafone" | "orange" | "etisalat" | "we" | "landline" | "ksa" | "uae" | "international" | "unknown";
  name_ar: string;
  name_en: string;
  badgeColor: string; // tailwind color class
  countryCode: string;
  formattedNumber: string;
}

export function detectPhoneCarrier(rawPhone?: string | null): PhoneCarrierInfo | null {
  if (!rawPhone || !rawPhone.trim()) return null;

  // Clean digits only
  const clean = rawPhone.replace(/[^0-9+]/g, "");

  // Normalize: remove leading 00 or + for prefix matching
  let normalized = clean;
  if (normalized.startsWith("+")) normalized = normalized.substring(1);
  if (normalized.startsWith("00")) normalized = normalized.substring(2);

  // Saudi Arabia (+966)
  if (normalized.startsWith("966")) {
    return {
      carrier: "ksa",
      name_ar: "السعودية 🇸🇦",
      name_en: "KSA",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      countryCode: "+966",
      formattedNumber: clean,
    };
  }

  // UAE (+971)
  if (normalized.startsWith("971")) {
    return {
      carrier: "uae",
      name_ar: "الإمارات 🇦🇪",
      name_en: "UAE",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
      countryCode: "+971",
      formattedNumber: clean,
    };
  }

  // Egypt prefix handling: strip 20 if present
  let localEgypt = normalized;
  if (localEgypt.startsWith("20")) {
    localEgypt = localEgypt.substring(2);
  }
  if (!localEgypt.startsWith("0") && localEgypt.length === 10) {
    localEgypt = "0" + localEgypt;
  }

  // Egypt Mobile Carriers
  if (localEgypt.startsWith("010")) {
    return {
      carrier: "vodafone",
      name_ar: "فودافون",
      name_en: "Vodafone",
      badgeColor: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200",
      countryCode: "+20",
      formattedNumber: localEgypt,
    };
  }

  if (localEgypt.startsWith("011")) {
    return {
      carrier: "etisalat",
      name_ar: "اتصالات",
      name_en: "Etisalat",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200",
      countryCode: "+20",
      formattedNumber: localEgypt,
    };
  }

  if (localEgypt.startsWith("012")) {
    return {
      carrier: "orange",
      name_ar: "أورنج",
      name_en: "Orange",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200",
      countryCode: "+20",
      formattedNumber: localEgypt,
    };
  }

  if (localEgypt.startsWith("015")) {
    return {
      carrier: "we",
      name_ar: "وي (المصرية)",
      name_en: "WE",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200",
      countryCode: "+20",
      formattedNumber: localEgypt,
    };
  }

  // Egypt Landlines
  if (localEgypt.startsWith("02") || localEgypt.startsWith("03")) {
    return {
      carrier: "landline",
      name_ar: "هاتف أرضي",
      name_en: "Landline",
      badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
      countryCode: "+20",
      formattedNumber: localEgypt,
    };
  }

  return {
    carrier: "international",
    name_ar: "دولي",
    name_en: "International",
    badgeColor: "bg-muted text-muted-foreground border-border",
    countryCode: "+",
    formattedNumber: clean,
  };
}
