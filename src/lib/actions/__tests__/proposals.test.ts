import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProposal,
  updateProposalVersionStatus,
} from "../proposals";

const mockUser = { id: "user-123", email: "sales@nilenexus.com" };

function createMockQuery(defaultData: unknown = null, defaultError: unknown = null) {
  const query: Record<string, unknown> = {};
  query.select = vi.fn().mockImplementation(() => query);
  query.insert = vi.fn().mockImplementation(() => query);
  query.update = vi.fn().mockImplementation(() => query);
  query.delete = vi.fn().mockImplementation(() => query);
  query.eq = vi.fn().mockImplementation(() => query);
  query.order = vi.fn().mockImplementation(() => query);
  query.range = vi.fn().mockImplementation(() => query);
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
    rpc: vi.fn(async () => ({ data: "PROP-00001", error: null })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Proposals Server Actions", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProposal", () => {
    it("fails when items array is empty", async () => {
      const res = await createProposal({
        client_id: validUUID,
        deal_id: validUUID,
        items: [],
      });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates proposal and initial version successfully", async () => {
      const insertedProp = {
        id: "prop-1",
        business_id: "PROP-00001",
        client_id: validUUID,
        deal_id: validUUID,
      };
      mockQueryInstance = createMockQuery(insertedProp);

      const res = await createProposal({
        client_id: validUUID,
        deal_id: validUUID,
        items: [
          {
            description_ar: "تطوير تطبيق ويب",
            quantity: 1,
            unit_price: 50000,
          },
        ],
        discount_percentage: 10,
        currency: "EGP",
      });

      expect(res.success).toBe(true);
      expect(res.data?.id).toBe("prop-1");
    });
  });

  describe("updateProposalVersionStatus", () => {
    it("prevents changing status of already accepted proposal", async () => {
      const acceptedVersion = {
        id: validUUID,
        proposal_id: validUUID,
        version_number: 1,
        status: "ACCEPTED",
        grand_total: "45000.00",
        currency: "EGP",
      };
      mockQueryInstance = createMockQuery(acceptedVersion);

      const res = await updateProposalVersionStatus({
        version_id: validUUID,
        status: "DRAFT",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("غير قابل للتعديل");
    });

    it("updates status to SENT successfully", async () => {
      const draftVersion = {
        id: validUUID,
        proposal_id: validUUID,
        version_number: 1,
        status: "DRAFT",
        grand_total: "45000.00",
        currency: "EGP",
      };
      mockQueryInstance = createMockQuery(draftVersion);

      const res = await updateProposalVersionStatus({
        version_id: validUUID,
        status: "SENT",
        notes: "تم الإرسال للعميل",
      });

      expect(res.success).toBe(true);
    });
  });
});
