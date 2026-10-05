import { describe, it, expect } from "vitest";
import {
  createClientSchema,
  contactSchema,
} from "../client";

describe("Client & Contact Schema Validation", () => {
  describe("createClientSchema", () => {
    it("validates a minimal valid company client", () => {
      const input = {
        name: "Acme Industrial Group",
        type: "COMPANY" as const,
      };
      const result = createClientSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Acme Industrial Group");
        expect(result.data.type).toBe("COMPANY");
      }
    });

    it("validates an individual client with primary contact", () => {
      const input = {
        name: "Karim Mostafa",
        type: "INDIVIDUAL" as const,
        phone: "+201012345678",
        email: "karim@example.com",
        primary_contact: {
          name: "Karim Mostafa",
          phone: "+201012345678",
        },
      };
      const result = createClientSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects client name shorter than 2 characters", () => {
      const input = { name: "X" };
      const result = createClientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const input = {
        name: "Valid Name",
        email: "not-an-email",
      };
      const result = createClientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("contactSchema", () => {
    it("validates a contact with primary flag", () => {
      const input = {
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Ahmed Hassan",
        job_title: "Purchasing Director",
        phone: "01098765432",
        is_primary: true,
      };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_primary).toBe(true);
      }
    });

    it("rejects contact with invalid UUID client_id", () => {
      const input = {
        client_id: "not-a-uuid",
        name: "Test Contact",
      };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
