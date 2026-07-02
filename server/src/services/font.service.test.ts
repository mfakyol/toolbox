import { test } from "node:test";
import assert from "node:assert/strict";
import { convertFont } from "./font.service.js";
import { AppError } from "../utils/AppError.js";

test("throws AppError on an invalid font buffer", async () => {
  const garbage = Buffer.from("not a real font");
  await assert.rejects(() => convertFont(garbage, "woff2"), AppError);
});

test("throws AppError on an unsupported target format", async () => {
  const garbage = Buffer.from("x");
  await assert.rejects(
    () => convertFont(garbage, "eot" as never),
    AppError
  );
});
