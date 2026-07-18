import { type Result, ok } from "./result";
import { postForm } from "./http";

// Sends the image to the backend, returns the favicon pack (ZIP) as a blob.
export async function generateFavicons(file: File): Promise<Result<Blob>> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await postForm("/api/favicon", fd);
  if (!res.success) return res;
  return ok(await res.data.blob());
}
