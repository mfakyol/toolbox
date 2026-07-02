import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { optimizeImage } from "./optimizer.service.js";
import { AppError } from "../utils/AppError.js";

// Produces a flat-color sample image for tests.
function sampleImage(width = 100, height = 80): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 10, g: 20, b: 30 },
    },
  })
    .png()
    .toBuffer();
}

test("converts PNG to WebP", async () => {
  const input = await sampleImage();
  const res = await optimizeImage(input, { format: "webp", quality: 70 });

  assert.equal(res.format, "webp");
  assert.equal(res.width, 100);
  assert.equal(res.height, 80);

  const meta = await sharp(res.buffer).metadata();
  assert.equal(meta.format, "webp");
});

test("resizes preserving aspect ratio with fit=inside", async () => {
  const input = await sampleImage(100, 80);
  const res = await optimizeImage(input, { format: "jpeg", width: 50 });

  assert.equal(res.width, 50);
  assert.equal(res.height, 40); // 100x80 -> 50x40
});

test("does not enlarge (withoutEnlargement)", async () => {
  const input = await sampleImage(100, 80);
  const res = await optimizeImage(input, { format: "png", width: 400 });

  assert.equal(res.width, 100);
});

test("throws AppError on an unsupported format", async () => {
  const input = await sampleImage();
  await assert.rejects(
    () => optimizeImage(input, { format: "bmp" as never }),
    AppError
  );
});
