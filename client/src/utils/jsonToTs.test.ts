import { describe, it, expect } from "vitest";
import { jsonToTypescript } from "./jsonToTs";

describe("jsonToTypescript", () => {
  it("generates an interface from a simple object", () => {
    const out = jsonToTypescript('{"name":"a","age":3,"active":true}', {
      rootName: "User",
    });
    expect(out).toContain("export interface User {");
    expect(out).toContain("name: string;");
    expect(out).toContain("age: number;");
    expect(out).toContain("active: boolean;");
  });

  it("creates a separate interface for a nested object", () => {
    const out = jsonToTypescript('{"user":{"id":1}}', { rootName: "Root" });
    expect(out).toContain("user: User;");
    expect(out).toContain("export interface User {");
    expect(out).toContain("id: number;");
  });

  it("marks missing array fields optional and merges types", () => {
    const out = jsonToTypescript('[{"a":1},{"a":2,"b":"x"}]', {
      rootName: "Item",
    });
    expect(out).toContain("a: number;");
    expect(out).toContain("b?: string;");
  });

  it("makes a field containing null a union", () => {
    const out = jsonToTypescript('{"x":null}', { rootName: "Root" });
    expect(out).toContain("x: null;");
  });

  it("supports the type style", () => {
    const out = jsonToTypescript('{"a":1}', { rootName: "R", style: "type" });
    expect(out).toContain("export type R = {");
  });

  it("throws on invalid JSON", () => {
    expect(() => jsonToTypescript("{bad}")).toThrow();
  });
});
