import type { FontFormat, ConvertResult } from "../types";
import { type Result, ok } from "./result";
import { postForm, computeStats } from "./http";

const ENDPOINT = "/api/font/convert";

// Sends the font to the backend, returns the converted blob and stats.
export async function convertFont(
  file: File,
  format: FontFormat
): Promise<Result<ConvertResult>> {
  const fd = new FormData();
  fd.append("font", file);
  fd.append("format", format);

  const res = await postForm(ENDPOINT, fd);
  if (!res.success) return res;
  const response = res.data;

  const from = response.headers.get("X-Original-Format");
  const to = response.headers.get("X-Output-Format");

  return ok({
    ...(await computeStats(response, file)),
    meta: from && to ? `${from.toUpperCase()} → ${to.toUpperCase()}` : undefined,
  });
}
