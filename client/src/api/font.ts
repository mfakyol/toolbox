import type { FontFormat, ConvertResult } from "../types";
import { postForm, computeStats } from "./shared";

const ENDPOINT = "/api/font/convert";

// Sends the font to the backend, returns the converted blob and stats.
export async function convertFont(
  file: File,
  format: FontFormat
): Promise<ConvertResult> {
  const fd = new FormData();
  fd.append("font", file);
  fd.append("format", format);

  const res = await postForm(ENDPOINT, fd);
  const from = res.headers.get("X-Original-Format");
  const to = res.headers.get("X-Output-Format");

  return {
    ...(await computeStats(res, file)),
    meta: from && to ? `${from.toUpperCase()} → ${to.toUpperCase()}` : undefined,
  };
}
