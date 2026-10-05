import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDeal,
  updateDealStage,
} from "../deals";

const mockUser = { id: "user-123", email: "sales@nilenexus.com" };

function createMockQuery(defaultData: unknown = null, defaultError: unknown = null) {
  const query: Record<string, unknown> = {};
  query.select = vi.fn().mockImplementation(() => query);
  query.insert = vi.fn().mockImplementation(() => query);
  query.update = vi.fn().mockImplementation(() => query);
  query.delete = vi.fn().mockImplementation(() => query);
  query.eq = vi.fn().mockImplementation(() => query);
  query.ilike = vi.fn().mockImplementation(() => query);
  query.or = vi.fn().mockImplementation(() => query);
  query.order = vi.fn().mockImplementation(() => query);
  query.range = vi.fn().mockImplementation(() => query);
  query.is = vi.fn().mockImplementation(() => query);
  query.limit = vi.fn().mockImplementation(() => Promise.resolve({ data: defaultData, error: defaultError }));
  query.single = vi.fn().mockImplementation(() => Promise.resolve({ data: defaultData, error: defaultError }));
  query.then = (resolve: (val: unknown) => void) => resolve({ data: defaultData, error: defaultError, count: 1 });
  return query;
}

let mockQueryInstance = createMockQuery();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: vi.fn(() => mockQueryInstance),
    rpc: vi.fn(async () => ({ data: "DEAL-00001", error: null })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Deals Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeal", () => {
    it("fails when title is too short", async () => {
      const res = await createDeal({
        title: "X",
        client_id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates a deal successfully", async () => {
      const insertedDeal = {
        id: "deal-1",
        business_id: "DEAL-00001",
        title: "Mobile App Redesign",
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        stage: "NEW",
        currency: "EGP",
      };

      mockQueryInstance = createMockQuery(insertedDeal);

      const res = await createDeal({
        title: "Mobile App Redesign",
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        estimated_value: 80000,
      });

      expect(res.success).toBe(true);
      if (res.success && res.data) {
        expect(res.data.title).toBe("Mobile App Redesign");
      }
    });
  });

  describe("updateDealStage", () => {
    it("updates deal stage to WON", async () => {
      const existingDeal = {
        id: "deal-1",
        business_id: "DEAL-00001",
        title: "Mobile App Redesign",
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        stage: "NEGOTIATION",
      };

      mockQueryInstance = createMockQuery(existingDeal);

      const res = await updateDealStage({
        deal_id: "123e4567-e89b-12d3-a456-426614174000",
        stage: "WON",
        final_value: 85000,
      });

      expect(res.success).toBe(true);
    });
  });
});
