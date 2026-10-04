import { describe, it, expect } from "vitest";
import { locales, defaultLocale, localeDirection, localeNames } from "@/i18n/config";

describe("i18n config", () => {
  it("has Arabic as default locale", () => {
    expect(defaultLocale).toBe("ar");
  });

  it("supports Arabic and English", () => {
    expect(locales).toContain("ar");
    expect(locales).toContain("en");
    expect(locales).toHaveLength(2);
  });

  it("Arabic is RTL", () => {
    expect(localeDirection.ar).toBe("rtl");
  });

  it("English is LTR", () => {
    expect(localeDirection.en).toBe("ltr");
  });

  it("has display names for all locales", () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeDefined();
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });
});
