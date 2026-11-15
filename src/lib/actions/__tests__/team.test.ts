import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTeamMembers,
  updateMemberRole,
  toggleMemberStatus,
  deleteTeamMember,
} from "../team";

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

const GM_ID = "01ffbb15-b64b-4efe-a77e-2d5ae5d4a18a";
const ADMIN_ID = "bd1ce4e9-0445-4179-b770-4b65b2bf2f50";
const SALES_ID = "5e3931d2-b134-4c6a-bbfe-70314715cf12";

describe("Team Server Actions & Security Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSelect.mockReturnValue({
      order: mockOrder.mockResolvedValue({
        data: [
          { id: GM_ID, full_name: "GM User", role: "GM", is_active: true },
          { id: SALES_ID, full_name: "Sales User", role: "SALES", is_active: true },
        ],
        error: null,
      }),
      eq: mockEq.mockReturnValue({
        single: mockSingle,
      }),
    });

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it("fetches team members successfully", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: GM_ID } } });
    const res = await getTeamMembers();
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(2);
  });

  describe("updateMemberRole authorization", () => {
    it("allows GM to update a member role", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: GM_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "GM" }, error: null });

      const res = await updateMemberRole({
        user_id: SALES_ID,
        role: "ADMIN",
      });

      expect(res.success).toBe(true);
    });

    it("rejects non-GM users (e.g. SALES) from updating roles (privilege escalation defense)", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: SALES_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "SALES" }, error: null });

      const res = await updateMemberRole({
        user_id: SALES_ID,
        role: "GM",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("فقط المدير العام");
    });
  });

  describe("toggleMemberStatus authorization", () => {
    it("allows Admin or GM to toggle member active status", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: GM_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "ADMIN" }, error: null });

      const res = await toggleMemberStatus({
        user_id: SALES_ID,
        is_active: false,
      });

      expect(res.success).toBe(true);
    });

    it("rejects SALES users from toggling status", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: SALES_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "SALES" }, error: null });

      const res = await toggleMemberStatus({
        user_id: GM_ID,
        is_active: false,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("فقط المدير العام أو المشرف");
    });

    it("prevents self-deactivation", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: GM_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "GM" }, error: null });

      const res = await toggleMemberStatus({
        user_id: GM_ID,
        is_active: false,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("لا يمكنك تعطيل حسابك الشخصي");
    });
  });

  describe("deleteTeamMember authorization", () => {
    it("prevents GM from deleting their own account", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: GM_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "GM" }, error: null });

      const res = await deleteTeamMember({
        user_id: GM_ID,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("لا يمكنك حذف حسابك الشخصي");
    });

    it("prevents non-GM users from deleting team members", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: SALES_ID } } });
      mockSingle.mockResolvedValue({ data: { role: "ADMIN" }, error: null });

      const res = await deleteTeamMember({
        user_id: ADMIN_ID,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("فقط المدير العام");
    });
  });
});
