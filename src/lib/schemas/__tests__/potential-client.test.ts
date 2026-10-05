import { describe, it, expect } from "vitest";
import {
  createPotentialClientSchema,
  updateStatusSchema,
  normalizePhoneNumber,
  POTENTIAL_CLIENT_STATUSES,
  type OpportunityIndicatorType,
} from "../potential-client";

describe("Potential Client Schema Validation", () => {
  describe("normalizePhoneNumber", () => {
    it("strips formatting and leaves digits and plus", () => {
      expect(normalizePhoneNumber("+20 10 1234 5678")).toBe("+201012345678");
      expect(normalizePhoneNumber("010-1234-5678")).toBe("01012345678");
      expect(normalizePhoneNumber("  (02) 2345-6789 ")).toBe("0223456789");
    });

    it("returns null for empty or null strings", () => {
      expect(normalizePhoneNumber("")).toBeNull();
      expect(normalizePhoneNumber(null)).toBeNull();
      expect(normalizePhoneNumber("   ")).toBeNull();
    });
  });

  describe("createPotentialClientSchema", () => {
    it("validates a minimal valid potential client", () => {
      const input = {
        name: "CORE Coffee Roasters",
      };
      const result = createPotentialClientSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("CORE Coffee Roasters");
        expect(result.data.opportunities).toEqual([]);
      }
    });

    it("validates full potential client input with opportunities", () => {
      const input = {
        name: "El Borg Labs",
        area: "Maadi",
        phone: "+201000000000",
        website: "elborg.com",
        instagram: "@elborg",
        facebook: "elborglabs",
        notes: "Interested in full ERP overhaul and branding",
        opportunities: ["WEBSITE", "ERP_SYSTEM", "BRANDING"],
      };
      const result = createPotentialClientSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opportunities).toHaveLength(3);
        expect(result.data.opportunities).toContain("ERP_SYSTEM");
      }
    });

    it("rejects names shorter than 2 characters", () => {
      const input = { name: "A" };
      const result = createPotentialClientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid phone numbers with less than 7 digits", () => {
      const input = { name: "Test Corp", phone: "123" };
      const result = createPotentialClientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid opportunity indicators", () => {
      const input = {
        name: "Test Corp",
        opportunities: ["INVALID_OPP" as unknown as OpportunityIndicatorType],
      };
      const result = createPotentialClientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateStatusSchema", () => {
    it("accepts valid statuses", () => {
      for (const status of POTENTIAL_CLIENT_STATUSES) {
        const result = updateStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid status", () => {
      const result = updateStatusSchema.safeParse({ status: "UNKNOWN_STATUS" });
      expect(result.success).toBe(false);
    });
  });
});
