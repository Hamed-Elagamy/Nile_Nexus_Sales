import { describe, it, expect } from "vitest";
import {
  createProposalSchema,
  createProposalVersionSchema,
  updateProposalVersionStatusSchema,
  filterProposalsSchema,
} from "../proposal";

describe("proposalSchema", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  it("validates valid create proposal payload with items", () => {
    const valid = {
      client_id: validUUID,
      deal_id: validUUID,
      items: [
        {
          description_ar: "تطوير موقع ويب تعريفي",
          quantity: 1,
          unit_price: 35000,
        },
        {
          description_ar: "تصميم هوية بصرية كاملة",
          quantity: 1,
          unit_price: 15000,
        },
      ],
      discount_percentage: 10,
      currency: "EGP",
      delivery_duration: "30 يوم عمل",
      payment_terms: "50% دفعة أولى، 50% عند التسليم",
    };

    const parsed = createProposalSchema.parse(valid);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.currency).toBe("EGP");
    expect(parsed.discount_percentage).toBe(10);
  });

  it("fails if items array is empty", () => {
    const invalid = {
      client_id: validUUID,
      deal_id: validUUID,
      items: [],
    };
    expect(() => createProposalSchema.parse(invalid)).toThrow(
      "يجب إضافة بند واحد على الأقل"
    );
  });

  it("fails if item description is missing or too short", () => {
    const invalid = {
      client_id: validUUID,
      deal_id: validUUID,
      items: [
        {
          description_ar: "A",
          quantity: 1,
          unit_price: 100,
        },
      ],
    };
    expect(() => createProposalSchema.parse(invalid)).toThrow();
  });

  it("validates update proposal status payload", () => {
    const valid = {
      version_id: validUUID,
      status: "SENT",
      notes: "تم إرسال العرض المالي للعميل عبر الإيميل",
    };
    const parsed = updateProposalVersionStatusSchema.parse(valid);
    expect(parsed.status).toBe("SENT");
    expect(parsed.notes).toContain("إرسال العرض");
  });

  it("validates create proposal version payload", () => {
    const valid = {
      proposal_id: validUUID,
      items: [
        {
          description_ar: "بند مستحدث في الإصدار الثاني",
          quantity: 2,
          unit_price: 1000,
        },
      ],
      currency: "EGP",
      delivery_duration: "15 يوم عمل",
    };
    const parsed = createProposalVersionSchema.parse(valid);
    expect(parsed.proposal_id).toBe(validUUID);
    expect(parsed.items).toHaveLength(1);
  });

  it("applies default filters correctly", () => {
    const parsed = filterProposalsSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });
});
