// fontverter ships no types; we declare the surface we need here.
declare module "fontverter" {
  export type FontFormat = "truetype" | "sfnt" | "woff" | "woff2";

  export function convert(
    font: Buffer | Uint8Array,
    toFormat: FontFormat,
    fromFormat?: FontFormat
  ): Promise<Uint8Array>;

  export function detectFormat(
    font: Buffer | Uint8Array
  ): Promise<FontFormat | string>;
}
