import type { ImageConvertOptions, ConvertResult } from "../types";
import { postForm, computeStats } from "./shared";

const ENDPOINT = "/api/convert";

// Sends the image to the backend, returns the converted blob and stats.
export async function convertImage(
  file: File,
  opts: ImageConvertOptions
): Promise<ConvertResult> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("format", opts.format);
  fd.append("quality", String(opts.quality));
  if (opts.width) fd.append("width", String(opts.width));
  if (opts.height) fd.append("height", String(opts.height));
  fd.append("keepMetadata", String(opts.keepMetadata));

  const res = await postForm(ENDPOINT, fd);
  const ow = res.headers.get("X-Original-Width");
  const oh = res.headers.get("X-Original-Height");
  const w = res.headers.get("X-Output-Width");
  const h = res.headers.get("X-Output-Height");

  return {
    ...(await computeStats(res, file)),
    meta: buildDimsMeta(ow, oh, w, h),
  };
}

// Builds a string like "800 × 600 → 200 × 150 px".
// Shows a single size when unchanged.
function buildDimsMeta(
  ow: string | null,
  oh: string | null,
  w: string | null,
  h: string | null
): string | undefined {
  if (!w || !h) return undefined;
  const out = `${w} × ${h} px`;
  if (ow && oh && (ow !== w || oh !== h)) {
    return `${ow} × ${oh} → ${out}`;
  }
  return out;
}
