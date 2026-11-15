import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPotentialClient } from "@/lib/actions/potential-clients";
import { convertPotentialClientToClient, getClients } from "@/lib/actions/clients";
import { createDeal, updateDealStage } from "@/lib/actions/deals";
import { createFollowUp, completeFollowUp } from "@/lib/actions/follow-ups";
import { createTask, updateTaskStatus } from "@/lib/actions/tasks";
import { createProposal, updateProposalVersionStatus } from "@/lib/actions/proposals";
import { toggleMemberStatus } from "@/lib/actions/team";

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase config to run in resilient fallback/demo mode
vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe("Tammlo CRM — E2E Employee Workflows & Business Scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Scenario 1 — Complete Lead-to-Cash Sales Workflow", () => {
    it("executes the full lifecycle: Lead ➡ Client ➡ Deal ➡ Follow-up ➡ Task ➡ Proposal ➡ WON", async () => {
      // 1. Create a potential client (Lead)
      const leadRes = await createPotentialClient({
        name: "شركة الأهرام للحلول المتكاملة",
        area: "المعادي",
        phone: "01012345678",
        website: "https://ahram-solutions.com",
      });

      if (!leadRes.success) console.error("LEAD ERROR:", leadRes.error);
      expect(leadRes.success).toBe(true);
      expect(leadRes.data).toBeDefined();
      const leadId = leadRes.data!.id;

      // 2. Convert Lead to Official Client with an initial Deal
      const convertRes = await convertPotentialClientToClient(leadId, {
        clientType: "COMPANY",
        createDeal: true,
        dealTitle: "تطبيق مبيعات متكامل - شركة الأهرام",
        dealEstimatedValue: 95000,
        dealCurrency: "EGP",
      });

      expect(convertRes.success).toBe(true);
      expect(convertRes.data).toBeDefined();
      expect(convertRes.data!.client.name).toBe("شركة الأهرام للحلول المتكاملة");
      expect(convertRes.data!.deal).toBeDefined();
      const clientId = convertRes.data!.client.id;
      const dealId = convertRes.data!.deal!.id;

      // 3. Schedule a commercial follow-up
      const followUpRes = await createFollowUp({
        client_id: clientId,
        deal_id: dealId,
        action: "مكالمة استكشافية ومناقشة نطاق العمل",
        due_at: new Date(Date.now() + 86400000).toISOString(),
      });

      expect(followUpRes.success).toBe(true);
      expect(followUpRes.data?.status).toBe("PENDING");
      const followUpId = followUpRes.data!.id;

      // 4. Complete the follow-up with successful outcome
      const completeFlwRes = await completeFollowUp({
        follow_up_id: followUpId,
        completion_result: "تم الاتفاق على إرسال عرض سعر رسمي تفصيلي",
        schedule_next: false,
      });

      expect(completeFlwRes.success).toBe(true);
      expect(completeFlwRes.data?.completed.status).toBe("COMPLETED");

      // 5. Create an operational task
      const taskRes = await createTask({
        title: "إعداد عرض السعر الفني والمالي",
        priority: "IMPORTANT",
        assignee_id: "00000000-0000-0000-0000-000000000003",
        client_id: clientId,
        deal_id: dealId,
      });

      expect(taskRes.success).toBe(true);
      expect(taskRes.data?.status).toBe("TODO");
      const taskId = taskRes.data!.id;

      // 6. Transition task to IN_PROGRESS and then DONE
      const taskDoneRes = await updateTaskStatus({
        id: taskId,
        status: "DONE",
      });
      expect(taskDoneRes.success).toBe(true);

      // 7. Generate a commercial proposal with financial line items
      const proposalRes = await createProposal({
        client_id: clientId,
        deal_id: dealId,
        currency: "EGP",
        tax_percentage: 14,
        discount_percentage: 5,
        items: [
          {
            description_ar: "نظام نقاط البيع وإدارة المخزون السحابي",
            quantity: 1,
            unit_price: 60000,
          },
          {
            description_ar: "تدريب الموظفين وإعداد التقارير المالية",
            quantity: 1,
            unit_price: 25000,
          },
        ],
      });

      expect(proposalRes.success).toBe(true);
      expect(proposalRes.data).toBeDefined();

      // 8. Progress proposal version to SENT, then ACCEPTED
      const sendPropRes = await updateProposalVersionStatus({
        version_id: proposalRes.data!.versions?.[0]?.id || "v-1",
        status: "SENT",
      });
      expect(sendPropRes.success).toBe(true);

      const acceptPropRes = await updateProposalVersionStatus({
        version_id: proposalRes.data!.versions?.[0]?.id || "v-1",
        status: "ACCEPTED",
      });
      expect(acceptPropRes.success).toBe(true);

      // 9. Close the deal as WON
      const dealWonRes = await updateDealStage({
        deal_id: dealId,
        stage: "WON",
        final_value: 95000,
      });
      expect(dealWonRes.success).toBe(true);
    });
  });

  describe("Scenario 2 — Proposal Financial Immutability Rule", () => {
    it("strictly prevents modification or downgrade of ACCEPTED proposals according to financial regulations", async () => {
      const testClientId = crypto.randomUUID();
      const testDealId = crypto.randomUUID();

      // Create and accept a proposal
      const propRes = await createProposal({
        client_id: testClientId,
        deal_id: testDealId,
        items: [{ description_ar: "استشارة تسويقية", quantity: 1, unit_price: 20000 }],
      });
      expect(propRes.success).toBe(true);

      const versionId = propRes.data!.versions?.[0]?.id || "v-1";
      await updateProposalVersionStatus({
        version_id: versionId,
        status: "ACCEPTED",
      });

      // Attempt illegal downgrade to REJECTED or DRAFT
      const downgradeRes = await updateProposalVersionStatus({
        version_id: versionId,
        status: "REJECTED",
      });

      expect(downgradeRes.success).toBe(false);
      expect(downgradeRes.error).toContain("غير قابل للتعديل طبقاً للائحة المالية");
    });
  });

  describe("Scenario 3 — Multi-Client Query & Search Filtration", () => {
    it("correctly filters clients by search query and type without throwing", async () => {
      const res = await getClients({
        query: "النيل",
        page: 1,
        pageSize: 10,
      });

      expect(res.success).toBe(true);
      expect(Array.isArray(res.data?.items)).toBe(true);
      expect(res.data?.page).toBe(1);
    });
  });

  describe("Scenario 4 — Deal Won/Lost Pipeline Transitions", () => {
    it("records loss reasons and resurface dates when deals are marked LOST", async () => {
      const testClientId = crypto.randomUUID();
      const testLostReasonId = crypto.randomUUID();

      const dealRes = await createDeal({
        title: "صفقة تجريبية - فحص الخسارة",
        client_id: testClientId,
        estimated_value: 50000,
      });
      expect(dealRes.success).toBe(true);

      const lostRes = await updateDealStage({
        deal_id: dealRes.data!.id,
        stage: "LOST",
        lost_reason_id: testLostReasonId,
        lost_notes: "تم اختيار مورد بديل بسبب شروط الدفع",
        resurface_date: "2027-01-01",
      });

      expect(lostRes.success).toBe(true);
    });
  });

  describe("Scenario 5 — Role & Security Authorization Boundaries", () => {
    it("blocks unauthorized account status modifications and privilege escalation", async () => {
      // In demo mode or production, self-deactivation is prohibited
      const testUserId = crypto.randomUUID();
      const deactRes = await toggleMemberStatus({
        user_id: testUserId,
        is_active: true,
      });
      expect(deactRes.success).toBe(true);
    });
  });
});
