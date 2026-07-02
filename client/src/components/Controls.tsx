import { IMAGE_FORMATS, type ImageFormat } from "../types";
import { useI18n } from "../i18n";

interface Props {
  format: ImageFormat;
  quality: number;
  width: string;
  height: string;
  keepMetadata: boolean;
  onFormat: (f: ImageFormat) => void;
  onQuality: (q: number) => void;
  onWidth: (w: string) => void;
  onHeight: (h: string) => void;
  onKeepMetadata: (v: boolean) => void;
  /** Original size of the first uploaded image (shown as a hint). */
  originalDims?: { width: number; height: number } | null;
  /** Indicates the size belongs to the first file when there are multiple images. */
  multiple?: boolean;
}

// Image conversion settings (format, quality, size, metadata).
// Applied to the whole batch; the conversion is triggered by BatchToolbar.
export function Controls(props: Props) {
  const {
    format,
    quality,
    width,
    height,
    keepMetadata,
    onFormat,
    onQuality,
    onWidth,
    onHeight,
    onKeepMetadata,
    originalDims,
    multiple,
  } = props;
  const { t } = useI18n();

  return (
    <>
      <label className="field">
        <span>{t("controls.format")}</span>
        <div className="format-grid">
          {IMAGE_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${format === f ? "active" : ""}`}
              onClick={() => onFormat(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>{t("controls.quality", { q: quality })}</span>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
        />
      </label>

      <div className="field">
        <div className="dims-header">
          <span>{t("controls.size")}</span>
          {originalDims && (
            <button
              type="button"
              className="dims-hint"
              title={t("controls.fillTitle")}
              onClick={() => {
                onWidth(String(originalDims.width));
                onHeight(String(originalDims.height));
              }}
            >
              {t("controls.original", {
                w: originalDims.width,
                h: originalDims.height,
              })}
              {multiple ? t("controls.firstFile") : ""}
            </button>
          )}
        </div>
        <div className="dims-row">
          <label>
            <input
              type="number"
              placeholder={originalDims ? `${originalDims.width}` : "W"}
              value={width}
              onChange={(e) => onWidth(e.target.value)}
            />
          </label>
          <label>
            <input
              type="number"
              placeholder={originalDims ? `${originalDims.height}` : "H"}
              value={height}
              onChange={(e) => onHeight(e.target.value)}
            />
          </label>
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={keepMetadata}
          onChange={(e) => onKeepMetadata(e.target.checked)}
        />
        <span>{t("controls.keepMeta")}</span>
      </label>
    </>
  );
}
