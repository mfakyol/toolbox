import { describe, it, expect } from "vitest";
import { formatBytes } from "./format";

describe("formatBytes", () => {
  it("shows zero as '0 B'", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("picks byte / KB / MB units correctly", () => {
    expect(formatBytes(512)).toBe("512.00 B");
    expect(formatBytes(1024)).toBe("1.00 KB");
    expect(formatBytes(1536)).toBe("1.50 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
  });
});
