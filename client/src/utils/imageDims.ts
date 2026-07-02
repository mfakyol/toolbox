export interface Dims {
  width: number;
  height: number;
}

// Reads the natural (pixel) dimensions of an image file.
// Tries createImageBitmap first; falls back to <img> if unsupported.
export async function getImageDimensions(file: File): Promise<Dims | null> {
  if (!file.type.startsWith("image/")) return null;

  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      const dims = { width: bmp.width, height: bmp.height };
      bmp.close();
      return dims;
    } catch {
      // some formats (e.g. avif in some browsers) may be unsupported
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
