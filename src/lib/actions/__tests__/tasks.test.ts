import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskFormData,
} from "../tasks";

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
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Tasks Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTask", () => {
    it("fails when title is too short", async () => {
      const res = await createTask({
        title: "x",
        assignee_id: "usr-001",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("creates a task successfully", async () => {
      const createdRow = {
        id: "tsk-001",
        title: "تجهيز مسودة العقد",
        notes: "التواصل مع العميل",
        priority: "URGENT",
        status: "TODO",
        deadline: new Date().toISOString(),
        assignee_id: "usr-001",
        created_by: "user-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockQueryInstance = createMockQuery(createdRow);

      const res = await createTask({
        title: "تجهيز مسودة العقد",
        notes: "التواصل مع العميل",
        priority: "URGENT",
        assignee_id: "usr-001",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.title).toBe("تجهيز مسودة العقد");
      expect(res.data?.priority).toBe("URGENT");
    });
  });

  describe("getTasks", () => {
    it("fetches tasks list with metrics", async () => {
      const taskRows = [
        {
          id: "tsk-001",
          title: "مهمة 1",
          priority: "URGENT",
          status: "TODO",
          created_at: new Date().toISOString(),
        },
        {
          id: "tsk-002",
          title: "مهمة 2",
          priority: "NORMAL",
          status: "IN_PROGRESS",
          created_at: new Date().toISOString(),
        },
      ];

      mockQueryInstance = createMockQuery(taskRows);

      const res = await getTasks();
      expect(res.success).toBe(true);
      expect(res.data?.items.length).toBe(2);
      expect(res.data?.metrics.total).toBe(2);
      expect(res.data?.metrics.urgent).toBe(1);
      expect(res.data?.metrics.inProgress).toBe(1);
    });
  });

  describe("updateTaskStatus", () => {
    it("updates task status successfully", async () => {
      mockQueryInstance = createMockQuery(null, null);

      const res = await updateTaskStatus({
        id: "tsk-001",
        status: "DONE",
      });

      expect(res.success).toBe(true);
    });
  });

  describe("updateTask", () => {
    it("updates task fields successfully", async () => {
      const updatedRow = {
        id: "tsk-001",
        title: "عنوان معدل",
        priority: "IMPORTANT",
        status: "IN_PROGRESS",
      };

      mockQueryInstance = createMockQuery(updatedRow);

      const res = await updateTask({
        id: "tsk-001",
        title: "عنوان معدل",
        priority: "IMPORTANT",
      });

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe("عنوان معدل");
    });
  });

  describe("deleteTask", () => {
    it("deletes a task successfully", async () => {
      mockQueryInstance = createMockQuery(null, null);

      const res = await deleteTask("tsk-001");
      expect(res.success).toBe(true);
    });
  });

  describe("getTaskFormData", () => {
    it("returns form options", async () => {
      mockQueryInstance = createMockQuery([]);

      const res = await getTaskFormData();
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.profiles).toBeDefined();
    });
  });
});
