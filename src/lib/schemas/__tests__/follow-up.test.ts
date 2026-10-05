import { describe, it, expect } from "vitest";
import {
  createFollowUpSchema,
  completeFollowUpSchema,
  rescheduleFollowUpSchema,
  filterFollowUpsSchema,
} from "../follow-up";

describe("followUpSchema", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  it("validates valid create follow up payload", () => {
    const valid = {
      client_id: validUUID,
      action: "CALL",
      due_at: "2026-10-10T14:00:00Z",
      notes: "متابعة مع المدير العام بخصوص عرض السعر",
    };
    const parsed = createFollowUpSchema.parse(valid);
    expect(parsed.client_id).toBe(validUUID);
    expect(parsed.action).toBe("CALL");
    expect(parsed.due_at).toBe("2026-10-10T14:00:00Z");
  });

  it("fails if client_id is invalid", () => {
    const invalid = {
      client_id: "not-a-uuid",
      action: "CALL",
      due_at: "2026-10-10T14:00:00Z",
    };
    expect(() => createFollowUpSchema.parse(invalid)).toThrow();
  });

  it("validates complete follow up payload with next follow-up scheduling", () => {
    const valid = {
      follow_up_id: validUUID,
      completion_result: "العميل مهتم وطلب إرسال البورتفوليو",
      schedule_next: true,
      next_action: "WHATSAPP",
      next_due_at: "2026-10-12T10:00:00Z",
      next_notes: "إرسال ملف المشاريع على الواتساب",
    };
    const parsed = completeFollowUpSchema.parse(valid);
    expect(parsed.completion_result).toContain("العميل مهتم");
    expect(parsed.schedule_next).toBe(true);
  });

  it("validates reschedule follow up payload", () => {
    const valid = {
      follow_up_id: validUUID,
      new_due_at: "2026-10-15T12:00:00Z",
      reason: "العميل مسافر ويرجع الأسبوع القادم",
    };
    const parsed = rescheduleFollowUpSchema.parse(valid);
    expect(parsed.new_due_at).toBe("2026-10-15T12:00:00Z");
    expect(parsed.reason).toContain("العميل مسافر");
  });

  it("applies default filters correctly", () => {
    const parsed = filterFollowUpsSchema.parse({});
    expect(parsed.tab).toBe("TODAY");
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });
});
