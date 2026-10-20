import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCoffexLead,
  getCoffexLeads,
  updateCoffexLeadStatus,
  deleteCoffexLead,
} from "../coffex";

const mockUser = {
  id: "user-123",
  email: "sales@nilenexus.com",
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
    rpc: vi.fn(async () => ({ data: "CFX-00001", error: null })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Coffex Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCoffexLead", () => {
    it("fails when brand_name is missing or invalid", async () => {
      const res = await createCoffexLead({
        brand_name: "X",
        contact_name: "Ahmed",
        phone: "01012345678",
        city: "القاهرة",
        area: "التجمع",
        contact_role: "OWNER",
        activity_type: "SPECIALTY_CAFE",
        branches_count: "1",
        current_system: "NONE",
        interested_modules: [],
        interest_level: "HOT",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates a Coffex onsite lead successfully", async () => {
      const insertedRow = {
        id: "cfx-001",
        business_id: "CFX-00001",
        brand_name: "Bean & Brew Cafe",
        contact_name: "Moustafa",
        contact_role: "OWNER",
        phone: "01099887766",
        phone_normalized: "01099887766",
        city: "القاهرة",
        area: "المعادي",
        activity_type: "SPECIALTY_CAFE",
        branches_count: "2-3",
        current_system: "FOODICS",
        interest_level: "HOT",
        estimated_budget: 35000,
        status: "NEW",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockQueryInstance = createMockQuery(insertedRow);

      const res = await createCoffexLead({
        brand_name: "Bean & Brew Cafe",
        contact_name: "Moustafa",
        phone: "01099887766",
        city: "القاهرة",
        area: "المعادي",
        contact_role: "OWNER",
        activity_type: "SPECIALTY_CAFE",
        branches_count: "2-3",
        current_system: "FOODICS",
        interested_modules: ["POS", "RECIPES"],
        interest_level: "HOT",
        estimated_budget: 35000,
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      if (res.data) {
        expect(res.data.brand_name).toBe("Bean & Brew Cafe");
        expect(res.data.interest_level).toBe("HOT");
      }
    });
  });

  describe("getCoffexLeads", () => {
    it("returns list of leads and calculates metrics properly", async () => {
      const sampleLeads = [
        {
          id: "cfx-1",
          business_id: "CFX-00001",
          brand_name: "Circle Cafe",
          contact_name: "Tarek",
          contact_role: "OWNER",
          phone: "01011223344",
          city: "القاهرة",
          area: "التجمع الخامس",
          activity_type: "SPECIALTY_CAFE",
          branches_count: "2-3",
          current_system: "NONE",
          interest_level: "HOT",
          estimated_budget: 40000,
          status: "NEW",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockQueryInstance = createMockQuery(sampleLeads);

      const res = await getCoffexLeads();
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      if (res.data) {
        expect(res.data.leads.length).toBe(1);
        expect(res.data.metrics.totalLeads).toBe(1);
        expect(res.data.metrics.hotLeadsCount).toBe(1);
        expect(res.data.metrics.estimatedPipelineValue).toBe(40000);
      }
    });
  });

  describe("updateCoffexLeadStatus", () => {
    it("updates lead status successfully", async () => {
      mockQueryInstance = createMockQuery({ id: "cfx-1", status: "WON" });

      const res = await updateCoffexLeadStatus({
        id: "cfx-1",
        status: "WON",
      });

      expect(res.success).toBe(true);
    });
  });

  describe("deleteCoffexLead", () => {
    it("deletes or archives lead successfully", async () => {
      mockQueryInstance = createMockQuery({ id: "cfx-1" });

      const res = await deleteCoffexLead("cfx-1");
      expect(res.success).toBe(true);
    });
  });
});
