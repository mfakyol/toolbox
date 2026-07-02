import { describe, it, expect } from "vitest";
import { runWithConcurrency } from "./pool";

describe("runWithConcurrency", () => {
  it("never runs more than the limit at once and processes all", async () => {
    let active = 0;
    let peak = 0;
    const processed: number[] = [];
    const items = Array.from({ length: 23 }, (_, i) => i);

    await runWithConcurrency(items, 10, async (n) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      processed.push(n);
      active--;
    });

    expect(peak).toBeLessThanOrEqual(10);
    expect(processed.length).toBe(23);
    // All items processed (regardless of order).
    expect([...processed].sort((a, b) => a - b)).toEqual(items);
  });

  it("handles fewer items than the limit", async () => {
    const items = [1, 2, 3];
    const out: number[] = [];
    await runWithConcurrency(items, 10, async (n) => {
      out.push(n);
    });
    expect(out.sort()).toEqual([1, 2, 3]);
  });

  it("runs nothing for an empty list", async () => {
    let called = 0;
    await runWithConcurrency([], 5, async () => {
      called++;
    });
    expect(called).toBe(0);
  });
});
