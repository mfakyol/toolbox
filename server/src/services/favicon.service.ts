import sharp from "sharp";
import JSZip from "jszip";
import pngToIco from "png-to-ico";
import { AppError } from "../utils/AppError.js";

// PNG sizes to generate.
const PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512] as const;
// Sizes embedded into favicon.ico.
const ICO_SIZES = [16, 32, 48] as const;

const MANIFEST = JSON.stringify(
  {
    name: "",
    short_name: "",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

const HEAD_SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
`;

/**
 * Generates a ZIP containing all favicon sizes, favicon.ico, the manifest and
 * a <head> snippet, from a single image.
 */
export async function generateFavicons(input: Buffer): Promise<Buffer> {
  // Validate that the source is a real image.
  try {
    await sharp(input).metadata();
  } catch {
    throw new AppError("Invalid or unrecognized image file.", 415);
  }

  // Produce a square PNG for each size.
  const pngs = new Map<number, Buffer>();
  await Promise.all(
    PNG_SIZES.map(async (size) => {
      const buf = await sharp(input)
        .resize(size, size, { fit: "cover" })
        .png()
        .toBuffer();
      pngs.set(size, buf);
    })
  );

  const icoBuffer = await pngToIco(ICO_SIZES.map((s) => pngs.get(s)!));

  const zip = new JSZip();
  zip.file("favicon.ico", icoBuffer);
  zip.file("favicon-16x16.png", pngs.get(16)!);
  zip.file("favicon-32x32.png", pngs.get(32)!);
  zip.file("favicon-48x48.png", pngs.get(48)!);
  zip.file("apple-touch-icon.png", pngs.get(180)!);
  zip.file("android-chrome-192x192.png", pngs.get(192)!);
  zip.file("android-chrome-512x512.png", pngs.get(512)!);
  zip.file("site.webmanifest", MANIFEST);
  zip.file("head-tags.html", HEAD_SNIPPET);

  return zip.generateAsync({ type: "nodebuffer" });
}
