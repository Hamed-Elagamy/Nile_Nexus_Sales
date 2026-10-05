import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFollowUp,
  completeFollowUp,
  rescheduleFollowUp,
} from "../follow-ups";

const mockUser = { id: "user-123", email: "sales@nilenexus.com" };

function createMockQuery(defaultData: unknown = null, defaultError: unknown = null) {
  const query: Record<string, unknown> = {};
  query.select = vi.fn().mockImplementation(() => query);
  query.insert = vi.fn().mockImplementation(() => query);
  query.update = vi.fn().mockImplementation(() => query);
  query.delete = vi.fn().mockImplementation(() => query);
  query.eq = vi.fn().mockImplementation(() => query);
  query.gte = vi.fn().mockImplementation(() => query);
  query.lte = vi.fn().mockImplementation(() => query);
  query.gt = vi.fn().mockImplementation(() => query);
  query.lt = vi.fn().mockImplementation(() => query);
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
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Follow-ups Server Actions", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFollowUp", () => {
    it("fails with invalid client id", async () => {
      const res = await createFollowUp({
        client_id: "not-uuid",
        due_at: "2026-10-10T10:00:00Z",
        action: "CALL",
      });
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates follow-up successfully", async () => {
      const fakeFollowUp = {
        id: "fu-1",
        client_id: validUUID,
        due_at: "2026-10-10T10:00:00Z",
        action: "CALL",
        status: "PENDING",
      };
      mockQueryInstance = createMockQuery(fakeFollowUp);

      const res = await createFollowUp({
        client_id: validUUID,
        due_at: "2026-10-10T10:00:00Z",
        action: "CALL",
      });
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe("fu-1");
    });
  });

  describe("completeFollowUp", () => {
    it("completes follow up with result notes", async () => {
      const existing = {
        id: validUUID,
        client_id: validUUID,
        deal_id: null,
        action: "CALL",
        responsible_id: mockUser.id,
      };
      mockQueryInstance = createMockQuery(existing);

      const res = await completeFollowUp({
        follow_up_id: validUUID,
        completion_result: "تم الاتفاق على إرسال العرض المالي",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("rescheduleFollowUp", () => {
    it("reschedules follow up to a new date", async () => {
      const existing = {
        id: validUUID,
        client_id: validUUID,
        due_at: "2026-10-10T10:00:00Z",
      };
      mockQueryInstance = createMockQuery(existing);

      const res = await rescheduleFollowUp({
        follow_up_id: validUUID,
        new_due_at: "2026-10-15T10:00:00Z",
        reason: "العميل في اجتماع",
      });
      expect(res.success).toBe(true);
    });
  });
});
