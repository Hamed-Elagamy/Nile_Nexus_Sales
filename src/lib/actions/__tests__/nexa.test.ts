import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createNexaLead,
  getNexaLeads,
  updateNexaLeadStatus,
  deleteNexaLead,
} from "../nexa";

const mockUser = {
  id: "user-123",
  email: "sales@tammlo.com",
  user_metadata: { full_name: "محمد حامد" },
};

function createMockQuery(defaultData: unknown = null, defaultError: unknown = null) {
  const query: Record<string, unknown> = {};
  query.select = vi.fn().mockImplementation(() => query);
  query.insert = vi.fn().mockImplementation(() => query);
  query.update = vi.fn().mockImplementation(() => query);
  query.delete = vi.fn().mockImplementation(() => query);
  query.eq = vi.fn().mockImplementation(() => query);
  query.ilike = vi.fn().mockImplementation(() => query);
  query.is = vi.fn().mockImplementation(() => query);
  query.order = vi.fn().mockImplementation(() => query);
  query.or = vi.fn().mockImplementation(() => query);
  query.like = vi.fn().mockImplementation(() => query);
  query.single = vi.fn().mockImplementation(() =>
    Promise.resolve({ data: defaultData, error: defaultError })
  );
  query.then = (resolve: (val: unknown) => void) =>
    resolve({ data: defaultData, error: defaultError });
  return query;
}

let mockQueryInstance = createMockQuery();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: vi.fn(() => mockQueryInstance),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Nexa Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNexaLead", () => {
    it("fails when brand_name is missing or invalid", async () => {
      const res = await createNexaLead({
        brand_name: "X",
        contact_name: "Ahmed",
        phone: "01012345678",
        city: "القاهرة",
        area: "التجمع",
        contact_role: "OWNER",
        vertical_type: "FASHION_APPAREL",
        commerce_model: "OMNICHANNEL",
        current_system: "NONE_EXCEL",
        branches_count: "1",
        plan_interest: "GROWTH",
        interest_level: "HOT",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates a Nexa lead successfully", async () => {
      const insertedRow = {
        id: "nxa-001",
        business_id: "NXA-00001",
        brand_name: "Cairo Fashion House",
        contact_name: "Mahmoud",
        contact_role: "OWNER",
        phone: "01099887766",
        phone_normalized: "01099887766",
        city: "القاهرة",
        area: "المعادي",
        vertical_type: "FASHION_APPAREL",
        commerce_model: "OMNICHANNEL",
        current_system: "SHOPIFY",
        branches_count: "2-3",
        plan_interest: "GROWTH",
        interest_level: "HOT",
        estimated_budget: 35000,
        status: "NEW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockQueryInstance = createMockQuery(insertedRow);

      const res = await createNexaLead({
        brand_name: "Cairo Fashion House",
        contact_name: "Mahmoud",
        phone: "01099887766",
        city: "القاهرة",
        area: "المعادي",
        contact_role: "OWNER",
        vertical_type: "FASHION_APPAREL",
        commerce_model: "OMNICHANNEL",
        current_system: "SHOPIFY",
        branches_count: "2-3",
        plan_interest: "GROWTH",
        interest_level: "HOT",
        estimated_budget: 35000,
      });

      expect(res.success).toBe(true);
      expect(res.data?.brand_name).toBe("Cairo Fashion House");
    });
  });

  describe("getNexaLeads", () => {
    it("returns list of Nexa leads with metrics", async () => {
      const mockLeads = [
        {
          id: "nxa-1",
          business_id: "NXA-00001",
          brand_name: "Store 1",
          contact_name: "Owner 1",
          phone: "01011111111",
          branches_count: "1",
          interest_level: "HOT",
          status: "NEW",
          estimated_budget: 20000,
        },
      ];

      mockQueryInstance = createMockQuery(mockLeads);

      const res = await getNexaLeads();
      expect(res.success).toBe(true);
      expect(res.data?.leads).toBeDefined();
      expect(res.data?.metrics).toBeDefined();
    });
  });

  describe("updateNexaLeadStatus", () => {
    it("updates lead status properly", async () => {
      const updatedRow = {
        id: "nxa-1",
        status: "WON",
        updated_at: new Date().toISOString(),
      };

      mockQueryInstance = createMockQuery(updatedRow);

      const res = await updateNexaLeadStatus({
        id: "nxa-1",
        status: "WON",
      });

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe("WON");
    });
  });

  describe("deleteNexaLead", () => {
    it("archives lead successfully", async () => {
      mockQueryInstance = createMockQuery(null);

      const res = await deleteNexaLead("nxa-1");
      expect(res.success).toBe(true);
    });
  });
});
