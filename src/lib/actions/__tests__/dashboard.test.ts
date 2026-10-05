import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardMetrics } from "../dashboard";

function createMockQuery(defaultData: unknown = [], count: number = 5) {
  const query: Record<string, unknown> = {};
  query.select = vi.fn().mockImplementation(() => query);
  query.is = vi.fn().mockImplementation(() => query);
  query.not = vi.fn().mockImplementation(() => query);
  query.eq = vi.fn().mockImplementation(() => query);
  query.gte = vi.fn().mockImplementation(() => query);
  query.lte = vi.fn().mockImplementation(() => query);
  query.lt = vi.fn().mockImplementation(() => query);
  query.order = vi.fn().mockImplementation(() => query);
  query.limit = vi.fn().mockImplementation(() => Promise.resolve({ data: defaultData, error: null, count }));
  query.then = (resolve: (val: unknown) => void) =>
    resolve({ data: defaultData, error: null, count });
  return query;
}

let mockQueryInstance = createMockQuery();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => mockQueryInstance),
  })),
}));

describe("Dashboard Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates pipeline metrics properly", async () => {
    const fakeDeals = [
      { estimated_value: 50000 },
      { estimated_value: 30000 },
    ];
    mockQueryInstance = createMockQuery(fakeDeals, 2);

    const res = await getDashboardMetrics();
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.openDealsCount).toBe(2);
    expect(res.data?.totalPipelineValue).toBe(80000);
  });
});
