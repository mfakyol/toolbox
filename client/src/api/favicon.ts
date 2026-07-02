import { postForm } from "./shared";

// Sends the image to the backend, returns the favicon pack (ZIP) as a blob.
export async function generateFavicons(file: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("image", file);
  const res = await postForm("/api/favicon", fd);
  return res.blob();
}
