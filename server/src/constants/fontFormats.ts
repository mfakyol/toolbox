// Supported font output formats and their fontverter target mapping.
// fontverter targets: "truetype" | "woff" | "woff2" | "sfnt"

export const FONT_FORMATS = {
  ttf: { ext: "ttf", mime: "font/ttf", target: "truetype" },
  woff: { ext: "woff", mime: "font/woff", target: "woff" },
  woff2: { ext: "woff2", mime: "font/woff2", target: "woff2" },
} as const;

export type FontFormat = keyof typeof FONT_FORMATS;

export const FONT_FORMAT_LIST = Object.keys(FONT_FORMATS) as FontFormat[];

// Accepted input file extensions.
export const ACCEPTED_FONT_EXTENSIONS = [
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
] as const;

export function isFontFormat(value: string): value is FontFormat {
  return value in FONT_FORMATS;
}
