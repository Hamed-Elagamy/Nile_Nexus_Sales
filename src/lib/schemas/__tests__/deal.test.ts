import { describe, it, expect } from "vitest";
import {
  createDealSchema,
  updateDealStageSchema,
  DEAL_STAGES,
} from "../deal";

describe("Deal Schema Validation", () => {
  it("validates a minimal valid deal", () => {
    const input = {
      title: "ERP Setup",
      client_id: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = createDealSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stage).toBe("NEW");
      expect(result.data.currency).toBe("EGP");
    }
  });

  it("validates deal with estimated value and services", () => {
    const input = {
      title: "Mobile App Development",
      client_id: "123e4567-e89b-12d3-a456-426614174000",
      stage: "PROPOSAL_SENT" as const,
      estimated_value: 150000,
      currency: "EGP",
      service_ids: ["123e4567-e89b-12d3-a456-426614174001"],
    };
    const result = createDealSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_value).toBe(150000);
      expect(result.data.service_ids).toHaveLength(1);
    }
  });

  it("rejects invalid stage update without valid deal_id", () => {
    const input = {
      deal_id: "invalid-id",
      stage: "WON" as const,
    };
    const result = updateDealStageSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts all valid deal stages", () => {
    for (const stage of DEAL_STAGES) {
      const result = updateDealStageSchema.safeParse({
        deal_id: "123e4567-e89b-12d3-a456-426614174000",
        stage,
      });
      expect(result.success).toBe(true);
    }
  });
});
