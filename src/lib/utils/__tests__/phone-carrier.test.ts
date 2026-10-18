import { describe, it, expect } from "vitest";
import { detectPhoneCarrier } from "../phone-carrier";

describe("detectPhoneCarrier", () => {
  it("returns null for empty or null inputs", () => {
    expect(detectPhoneCarrier(null)).toBeNull();
    expect(detectPhoneCarrier(undefined)).toBeNull();
    expect(detectPhoneCarrier("")).toBeNull();
    expect(detectPhoneCarrier("   ")).toBeNull();
  });

  it("identifies Vodafone numbers (010)", () => {
    const res = detectPhoneCarrier("01012345678");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("vodafone");
    expect(res?.name_ar).toBe("فودافون");
  });

  it("identifies Etisalat numbers (011)", () => {
    const res = detectPhoneCarrier("+201112223344");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("etisalat");
    expect(res?.name_ar).toBe("اتصالات");
  });

  it("identifies Orange numbers (012)", () => {
    const res = detectPhoneCarrier("01234567890");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("orange");
    expect(res?.name_ar).toBe("أورنج");
  });

  it("identifies WE numbers (015)", () => {
    const res = detectPhoneCarrier("01555555555");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("we");
    expect(res?.name_ar).toBe("وي (المصرية)");
  });

  it("identifies Landline numbers (02 / 03)", () => {
    const res = detectPhoneCarrier("0233445566");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("landline");
    expect(res?.name_ar).toBe("هاتف أرضي");
  });

  it("identifies Saudi numbers (+966)", () => {
    const res = detectPhoneCarrier("+966501234567");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("ksa");
    expect(res?.countryCode).toBe("+966");
  });

  it("identifies UAE numbers (+971)", () => {
    const res = detectPhoneCarrier("+971501234567");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("uae");
    expect(res?.countryCode).toBe("+971");
  });

  it("identifies other international numbers", () => {
    const res = detectPhoneCarrier("+447911123456");
    expect(res).not.toBeNull();
    expect(res?.carrier).toBe("international");
  });
});
