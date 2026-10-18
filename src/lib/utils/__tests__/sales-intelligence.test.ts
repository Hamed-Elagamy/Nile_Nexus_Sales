import { describe, it, expect } from "vitest";
import { evaluateClientHealth } from "@/components/clients/client-health-score";
import { calculateDealHeat } from "@/components/deals/deal-heat-badge";

describe("evaluateClientHealth", () => {
  it("evaluates a champion client with won deals and recent contact", () => {
    const res = evaluateClientHealth({
      wonDealsCount: 2,
      activeDealsCount: 1,
      daysSinceLastContact: 3,
      hasOverdueTasks: false,
    });
    expect(res.level).toBe("champion");
    expect(res.score).toBeGreaterThanOrEqual(85);
  });

  it("evaluates a healthy client with regular contact", () => {
    const res = evaluateClientHealth({
      wonDealsCount: 0,
      activeDealsCount: 1,
      daysSinceLastContact: 10,
      hasOverdueTasks: false,
    });
    expect(res.level).toBe("healthy");
    expect(res.score).toBeGreaterThanOrEqual(65);
  });

  it("evaluates an at-risk client with long contact gap", () => {
    const res = evaluateClientHealth({
      wonDealsCount: 0,
      activeDealsCount: 0,
      daysSinceLastContact: 30,
      hasOverdueTasks: true,
    });
    expect(["at_risk", "dormant"]).toContain(res.level);
    expect(res.score).toBeLessThan(65);
  });
});

describe("calculateDealHeat", () => {
  it("marks a recently updated open deal as HOT", () => {
    const now = new Date().toISOString();
    const heat = calculateDealHeat(now, false);
    expect(heat.temperature).toBe("HOT");
    expect(heat.label_ar).toContain("ساخنة");
  });

  it("marks an open deal without updates for 10 days as STALLED", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const heat = calculateDealHeat(tenDaysAgo, false);
    expect(heat.temperature).toBe("STALLED");
    expect(heat.label_ar).toContain("راكدة");
  });

  it("marks closed deals as ARCHIVED", () => {
    const heat = calculateDealHeat(new Date().toISOString(), true);
    expect(heat.temperature).toBe("ARCHIVED");
  });
});
