import { IMAGE_FORMATS, type ImageFormat } from "@/types";
import { useI18n } from "@/i18n";
import { Field, Chips, Checkbox } from "@/components/ui";
import styles from "./styles.module.scss";

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
      <Field label={t("controls.format")}>
        <Chips
          options={IMAGE_FORMATS}
          value={format}
          onChange={onFormat}
          render={(f) => f.toUpperCase()}
        />
      </Field>

      <Field label={t("controls.quality", { q: quality })}>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => onQuality(Number(e.target.value))}
        />
      </Field>

      <div>
        <div className={styles.dimsHeader}>
          <span>{t("controls.size")}</span>
          {originalDims && (
            <button
              type="button"
              className={styles.dimsHint}
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
        <div className={styles.dimsRow}>
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

      <Checkbox checked={keepMetadata} onChange={onKeepMetadata}>
        {t("controls.keepMeta")}
      </Checkbox>
    </>
  );
}
