import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  filterTasksSchema,
} from "../task";

describe("Task Schemas", () => {
  describe("createTaskSchema", () => {
    it("validates a valid task payload", () => {
      const valid = {
        title: "مراجعة العقد مع العميل",
        notes: "التأكد من بنود الدفعات",
        priority: "URGENT",
        deadline: "2026-11-20T10:00:00.000Z",
        assignee_id: "usr-001",
        client_id: "cli-001",
        deal_id: "deal-001",
      };
      const result = createTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("مراجعة العقد مع العميل");
        expect(result.data.priority).toBe("URGENT");
      }
    });

    it("applies default priority NORMAL when omitted", () => {
      const minimal = {
        title: "اتصال بالعميل",
        assignee_id: "usr-002",
      };
      const result = createTaskSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("NORMAL");
      }
    });

    it("rejects title shorter than 2 characters", () => {
      const invalid = {
        title: "ا",
        assignee_id: "usr-001",
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing assignee_id", () => {
      const invalid = {
        title: "مهمة بدون مسؤول",
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("updateTaskStatusSchema", () => {
    it("accepts valid statuses", () => {
      const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
      validStatuses.forEach((status) => {
        const result = updateTaskStatusSchema.safeParse({
          id: "tsk-001",
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid status", () => {
      const result = updateTaskStatusSchema.safeParse({
        id: "tsk-001",
        status: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("filterTasksSchema", () => {
    it("accepts valid filters", () => {
      const result = filterTasksSchema.safeParse({
        status: "IN_PROGRESS",
        priority: "URGENT",
        search: "عقد",
      });
      expect(result.success).toBe(true);
    });
  });
});
