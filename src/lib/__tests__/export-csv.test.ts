import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportToCsv } from "@/lib/utils/export-csv";

describe("exportToCsv utility", () => {
  let createdBlob: Blob | null = null;
  let clickedUrl = "";

  beforeEach(() => {
    createdBlob = null;
    clickedUrl = "";

    // Mock Blob and URL
    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlob = blob;
      return "blob:mock-url";
    });
    global.URL.revokeObjectURL = vi.fn();

    const mockAnchor = {
      href: "",
      download: "",
      style: { display: "" },
      click: vi.fn(function () {
        clickedUrl = mockAnchor.href;
      }),
      setAttribute: vi.fn((k: string, v: string) => {
        if (k === "href") mockAnchor.href = v;
      }),
      getAttribute: vi.fn((k: string) => (k === "href" ? mockAnchor.href : null)),
    };

    (global as unknown as { window: unknown }).window = {
      document: {
        createElement: vi.fn(() => mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      },
    };
    (global as unknown as { document: unknown }).document = (
      global as unknown as { window: { document: unknown } }
    ).window.document;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports data with UTF-8 BOM and correct headers", async () => {
    const data = [
      { id: 1, name: "تطبيق موبايل", price: 25000 },
      { id: 2, name: "موقع تعريفي", price: 10000 },
    ];

    exportToCsv(
      "test_services",
      [
        { header: "الكود", key: "id" },
        { header: "الاسم", key: "name" },
        { header: "السعر", key: "price" },
      ],
      data
    );

    expect(createdBlob).not.toBeNull();
    const text = await createdBlob!.text();

    // Must start with UTF-8 BOM (0xEF, 0xBB, 0xBF)
    const buffer = await createdBlob!.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    expect(bytes[0]).toBe(0xef);
    expect(bytes[1]).toBe(0xbb);
    expect(bytes[2]).toBe(0xbf);

    // Header row
    expect(text).toContain('"الكود","الاسم","السعر"');

    // Data rows
    expect(text).toContain('"1","تطبيق موبايل","25000"');
    expect(text).toContain('"2","موقع تعريفي","10000"');
  });

  it("handles custom formatters and quotes escaping", async () => {
    const data = [
      { name: 'باقة "VIP"', active: true },
    ];

    exportToCsv(
      "formatted_services",
      [
        {
          header: "اسم الخدمة",
          key: "name",
        },
        {
          header: "الحالة",
          formatter: (row) => (row.active ? "نشطة" : "معطلة"),
        },
      ],
      data
    );

    expect(createdBlob).not.toBeNull();
    const text = await createdBlob!.text();

    // Double quotes must be escaped as ""
    expect(text).toContain('"باقة ""VIP"""');
    expect(text).toContain('"نشطة"');
  });
});
