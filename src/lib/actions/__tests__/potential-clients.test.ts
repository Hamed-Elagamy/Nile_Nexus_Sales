import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPotentialClient,
  updatePotentialClientStatus,
  checkDuplicatePotentialClient,
} from "../potential-clients";
import type { PotentialClientStatusType } from "@/lib/schemas/potential-client";

// Mock Supabase Server Client
const mockUser = { id: "user-123", email: "sales@nilenexus.com" };

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: mockFrom,
    rpc: vi.fn(async () => ({ data: "PC-00042", error: null })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Potential Clients Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkDuplicatePotentialClient", () => {
    it("detects existing client by normalized phone", async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: "pc-1", name: "Existing Corp", business_id: "PC-00001" }],
          }),
        }),
        ilike: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [] }),
        }),
      });

      const res = await checkDuplicatePotentialClient({
        phone: "+201012345678",
      });

      expect(res.isDuplicate).toBe(true);
      expect(res.matches.length).toBeGreaterThan(0);
      expect(res.matches[0].name).toBe("Existing Corp");
    });
  });

  describe("createPotentialClient", () => {
    it("returns error when name is empty or too short", async () => {
      const result = await createPotentialClient({
        name: "",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("creates potential client with normalized phone and opportunities", async () => {
      const insertedClient = {
        id: "pc-1",
        business_id: "PC-00042",
        name: "Acme Corp",
        phone: "+201012345678",
        status: "NEW",
        research_owner_id: "user-123",
        created_by: "user-123",
      };

      // Mock duplicate checks returning empty
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [] }) }),
        ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [] }) }),
      });

      // Mock insert chain
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: insertedClient, error: null }),
        }),
      });

      const result = await createPotentialClient({
        name: "Acme Corp",
        phone: "+20 10 1234 5678",
        opportunities: ["WEBSITE", "ECOMMERCE"],
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe("Acme Corp");
        expect(result.data.opportunities).toContain("WEBSITE");
      }
    });
  });

  describe("updatePotentialClientStatus", () => {
    it("rejects invalid status", async () => {
      const result = await updatePotentialClientStatus(
        "pc-1",
        "INVALID" as unknown as PotentialClientStatusType
      );
      expect(result.success).toBe(false);
    });

    it("updates status to RESEARCHED successfully", async () => {
      // Mock fetching current client
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { status: "NEW", name: "Acme Corp", business_id: "PC-00042" },
            error: null,
          }),
        }),
      });

      // Mock update
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await updatePotentialClientStatus(
        "pc-1",
        "RESEARCHED",
        "Done thorough research"
      );
      expect(result.success).toBe(true);
    });
  });
});
