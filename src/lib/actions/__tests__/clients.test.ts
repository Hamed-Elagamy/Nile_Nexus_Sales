import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createClient,
  addContact,
  convertPotentialClientToClient,
} from "../clients";

const mockUser = { id: "user-123", email: "sales@nilenexus.com" };

// Chainable query builder helper for Supabase
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
    rpc: vi.fn(async () => ({ data: "CLIENT-00001", error: null })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Clients Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClient", () => {
    it("fails when name is too short", async () => {
      const res = await createClient({ name: "A", type: "COMPANY" });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates client successfully with primary contact", async () => {
      const insertedClient = {
        id: "client-1",
        business_id: "CLIENT-00001",
        name: "CORE Roasters",
        type: "COMPANY",
        created_by: "user-123",
      };

      mockQueryInstance = createMockQuery(insertedClient);

      const res = await createClient({
        name: "CORE Roasters",
        type: "COMPANY",
        phone: "+201012345678",
        primary_contact: {
          name: "Amr Ahmed",
          phone: "+201012345678",
        },
      });

      expect(res.success).toBe(true);
      if (res.success && res.data) {
        expect(res.data.name).toBe("CORE Roasters");
      }
    });
  });

  describe("addContact", () => {
    it("adds contact to a client", async () => {
      const insertedContact = {
        id: "contact-1",
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Sherif Kamal",
        is_primary: true,
      };

      mockQueryInstance = createMockQuery(insertedContact);

      const res = await addContact({
        client_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Sherif Kamal",
        is_primary: true,
      });

      expect(res.success).toBe(true);
      if (res.success && res.data) {
        expect(res.data.name).toBe("Sherif Kamal");
      }
    });
  });

  describe("convertPotentialClientToClient", () => {
    it("converts potential client and creates confirmed client", async () => {
      const insertedClient = {
        id: "client-2",
        business_id: "CLIENT-00002",
        name: "Nile Tech Solutions",
        type: "COMPANY",
        phone: "01011112222",
        status: "RESEARCHED",
      };

      mockQueryInstance = createMockQuery(insertedClient);

      const res = await convertPotentialClientToClient("pc-1", {
        clientType: "COMPANY",
        createDeal: true,
        dealTitle: "ERP Implementation",
      });

      expect(res.success).toBe(true);
      if (res.success && res.data) {
        expect(res.data.client.name).toBe("Nile Tech Solutions");
      }
    });
  });
});
