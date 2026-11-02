import { describe, it, expect } from "vitest";
import {
  createNexaLeadSchema,
  updateNexaLeadStatusSchema,
} from "../nexa";

describe("Nexa Zod Schemas", () => {
  describe("createNexaLeadSchema", () => {
    it("validates a complete valid onsite lead payload", () => {
      const validPayload = {
        brand_name: "Asala Fashion Store",
        contact_name: "Hajj Mahmoud",
        contact_role: "OWNER" as const,
        phone: "01012345678",
        store_url: "https://instagram.com/asala_store",
        city: "القاهرة",
        area: "التجمع الخامس",
        vertical_type: "FASHION_APPAREL" as const,
        commerce_model: "OMNICHANNEL" as const,
        current_system: "SHOPIFY" as const,
        monthly_order_volume: "500_2000" as const,
        branches_count: "2-3" as const,
        plan_interest: "GROWTH" as const,
        interest_level: "HOT" as const,
        estimated_budget: 45000,
        next_action: "تقديم ديمو شاشة الكاشير والمتجر أونلاين",
      };

      const result = createNexaLeadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.brand_name).toBe("Asala Fashion Store");
        expect(result.data.interest_level).toBe("HOT");
        expect(result.data.vertical_type).toBe("FASHION_APPAREL");
        expect(result.data.plan_interest).toBe("GROWTH");
      }
    });

    it("fails when brand_name is too short", () => {
      const invalidPayload = {
        brand_name: "A",
        contact_name: "Hajj Mahmoud",
        phone: "01012345678",
        area: "New Cairo",
      };

      const result = createNexaLeadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("fails when phone number is invalid or too short", () => {
      const invalidPayload = {
        brand_name: "Asala Store",
        contact_name: "Hajj Mahmoud",
        phone: "123",
        area: "New Cairo",
      };

      const result = createNexaLeadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("applies defaults for role, city, vertical, and interest level", () => {
      const minimalPayload = {
        brand_name: "Cairo Boutique",
        contact_name: "Karim",
        phone: "01122334455",
        area: "Maadi",
      };

      const result = createNexaLeadSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contact_role).toBe("OWNER");
        expect(result.data.interest_level).toBe("WARM");
        expect(result.data.city).toBe("القاهرة");
        expect(result.data.vertical_type).toBe("FASHION_APPAREL");
        expect(result.data.commerce_model).toBe("OMNICHANNEL");
      }
    });
  });

  describe("updateNexaLeadStatusSchema", () => {
    it("validates valid status transitions", () => {
      const result = updateNexaLeadStatusSchema.safeParse({
        id: "nxa-123",
        status: "DEMO_SCHEDULED",
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown statuses", () => {
      const result = updateNexaLeadStatusSchema.safeParse({
        id: "nxa-123",
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });
});
