import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates Tailwind classes", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
