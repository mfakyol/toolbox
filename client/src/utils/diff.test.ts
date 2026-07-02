import { describe, it, expect } from "vitest";
import { diffLines } from "./diff";

describe("diffLines", () => {
  it("no difference for identical texts", () => {
    const r = diffLines("a\nb\nc", "a\nb\nc");
    expect(r.added).toBe(0);
    expect(r.removed).toBe(0);
    expect(r.rows.every((row) => row.type === "equal")).toBe(true);
  });

  it("detects an added line", () => {
    const r = diffLines("a\nb", "a\nb\nc");
    expect(r.added).toBe(1);
    expect(r.removed).toBe(0);
    expect(r.rows.some((row) => row.type === "ins" && row.right === "c")).toBe(
      true
    );
  });

  it("detects a removed line", () => {
    const r = diffLines("a\nb\nc", "a\nc");
    expect(r.removed).toBe(1);
    expect(r.rows.some((row) => row.type === "del" && row.left === "b")).toBe(
      true
    );
  });

  it("pairs a changed line as 'mod'", () => {
    const r = diffLines("hello", "hallo");
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]).toMatchObject({
      type: "mod",
      left: "hello",
      right: "hallo",
    });
  });
});
