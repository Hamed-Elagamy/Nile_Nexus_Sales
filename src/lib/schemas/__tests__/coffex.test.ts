import { describe, it, expect } from "vitest";
import {
  createCoffexLeadSchema,
  updateCoffexLeadStatusSchema,
} from "../coffex";

describe("Coffex Zod Schemas", () => {
  describe("createCoffexLeadSchema", () => {
    it("validates a complete valid onsite lead payload", () => {
      const validPayload = {
        brand_name: "Circle Cafe & Roastery",
        contact_name: "Tarek Mansour",
        contact_role: "OWNER" as const,
        phone: "01012345678",
        city: "القاهرة",
        area: "التجمع الخامس",
        activity_type: "SPECIALTY_CAFE" as const,
        branches_count: "2-3" as const,
        current_system: "FOODICS" as const,
        interested_modules: ["POS", "RECIPES", "KDS"],
        interest_level: "HOT" as const,
        estimated_budget: 45000,
        next_action: "تقديم ديمو حي للشركاء",
      };

      const result = createCoffexLeadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.brand_name).toBe("Circle Cafe & Roastery");
        expect(result.data.interest_level).toBe("HOT");
        expect(result.data.interested_modules).toContain("POS");
      }
    });

    it("fails when brand_name is too short", () => {
      const invalidPayload = {
        brand_name: "C",
        contact_name: "Tarek Mansour",
        phone: "01012345678",
        area: "New Cairo",
      };

      const result = createCoffexLeadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("fails when phone number is invalid or too short", () => {
      const invalidPayload = {
        brand_name: "Circle Cafe",
        contact_name: "Tarek Mansour",
        phone: "123",
        area: "New Cairo",
      };

      const result = createCoffexLeadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("applies defaults for role, city, and interest level", () => {
      const minimalPayload = {
        brand_name: "Aura Roasters",
        contact_name: "Karim",
        phone: "01122334455",
        area: "Maadi",
      };

      const result = createCoffexLeadSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contact_role).toBe("OWNER");
        expect(result.data.interest_level).toBe("WARM");
        expect(result.data.city).toBe("القاهرة");
      }
    });
  });

  describe("updateCoffexLeadStatusSchema", () => {
    it("validates valid status transitions", () => {
      const result = updateCoffexLeadStatusSchema.safeParse({
        id: "cfx-123",
        status: "DEMO_SCHEDULED",
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown statuses", () => {
      const result = updateCoffexLeadStatusSchema.safeParse({
        id: "cfx-123",
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });
});
