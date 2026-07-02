import { describe, it, expect } from "vitest";
import { base64Encode, base64Decode, decodeJwt, hashText } from "./devtools";

describe("devtools", () => {
  it("base64 UTF-8 round-trip", () => {
    const s = "Hello 🌍 çğü";
    expect(base64Decode(base64Encode(s))).toBe(s);
  });

  it("base64 known value", () => {
    expect(base64Encode("hello")).toBe("aGVsbG8=");
  });

  it("decodes JWT header and payload", () => {
    // {"alg":"HS256","typ":"JWT"} . {"sub":"123","name":"Ada"} . sig
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIn0.abc";
    const { header, payload } = decodeJwt(token);
    expect(header).toMatchObject({ alg: "HS256", typ: "JWT" });
    expect(payload).toMatchObject({ sub: "123", name: "Ada" });
  });

  it("throws on invalid JWT", () => {
    expect(() => decodeJwt("onlyonepart")).toThrow();
  });

  it("SHA-256 known value", async () => {
    const h = await hashText("abc", "SHA-256");
    expect(h).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});
