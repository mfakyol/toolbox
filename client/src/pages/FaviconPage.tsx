import { useEffect, useRef, useState, type DragEvent } from "react";
import { generateFavicons } from "../api/favicon";
import { useI18n } from "../i18n";

const PREVIEW_SIZES = [16, 32, 48, 64];

export default function FaviconPage() {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function select(f: File | undefined | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }
    setError(null);
    setDone(false);
    setFile(f);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    select(e.dataTransfer.files?.[0]);
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      const blob = await generateFavicons(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicons.zip";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="page-intro">{t("favicon.intro")}</p>

      <div className="layout">
        <section className="panel">
          <div
            className={`dropzone ${dragging ? "dragging" : ""} ${
              previewUrl ? "has-preview" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="" className="preview" />
            ) : (
              <div className="dropzone-hint">
                <div className="icon">⭐</div>
                <p>{t("favicon.dropTitle")}</p>
                <span>{t("favicon.dropSub")}</span>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => select(e.target.files?.[0])}
            />
          </div>
        </section>

        <section className="panel controls">
          {previewUrl && (
            <div className="field">
              <span>{t("favicon.preview")}</span>
              <div className="fav-previews">
                {PREVIEW_SIZES.map((s) => (
                  <div key={s} className="fav-preview">
                    <img
                      src={previewUrl}
                      alt=""
                      style={{ width: s, height: s }}
                    />
                    <small>
                      {s}×{s}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="convert-btn"
            onClick={generate}
            disabled={!file || loading}
          >
            {loading ? t("favicon.generating") : t("favicon.generate")}
          </button>

          {error && <div className="error">⚠️ {error}</div>}
          {done && <div className="fav-done">{t("favicon.done")}</div>}
        </section>
      </div>
    </>
  );
}
