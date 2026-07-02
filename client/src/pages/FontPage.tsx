import { useCallback, useState } from "react";
import { BatchDropzone } from "../components/BatchDropzone";
import { JobList } from "../components/JobList";
import { BatchToolbar } from "../components/BatchToolbar";
import { useBatchConverter } from "../hooks/useBatchConverter";
import { convertFont } from "../api/font";
import { useI18n } from "../i18n";
import { FONT_FORMATS, type FontFormat } from "../types";

const ACCEPTED = [".ttf", ".otf", ".woff", ".woff2"];

export default function FontPage() {
  const { t } = useI18n();
  const [format, setFormat] = useState<FontFormat>("woff2");

  const validateFont = useCallback(
    (file: File): string | null => {
      const lower = file.name.toLowerCase();
      return ACCEPTED.some((ext) => lower.endsWith(ext))
        ? null
        : t("font.notFont", { name: file.name });
    },
    [t]
  );

  const batch = useBatchConverter(convertFont, validateFont);

  const handleRun = useCallback(() => {
    void batch.run(format);
  }, [batch, format]);

  return (
    <>
      <p className="page-intro">{t("font.intro")}</p>

      <div className="layout">
        <section className="panel">
          <BatchDropzone
            accept=".ttf,.otf,.woff,.woff2"
            hintTitle={t("font.dropTitle")}
            hintSub={t("font.dropSub")}
            onFiles={batch.addFiles}
          />
          {batch.error && <div className="error">⚠️ {batch.error}</div>}
          <JobList jobs={batch.jobs} showThumb={false} onRemove={batch.removeJob} />
        </section>

        <section className="panel controls">
          <label className="field">
            <span>{t("controls.format")}</span>
            <div className="format-grid">
              {FONT_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip ${format === f ? "active" : ""}`}
                  onClick={() => setFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </label>

          <BatchToolbar
            jobs={batch.jobs}
            running={batch.running}
            done={batch.done}
            total={batch.total}
            runLabel={t("font.run")}
            zipName="converted-fonts.zip"
            onRun={handleRun}
            onClear={batch.clear}
          />
        </section>
      </div>
    </>
  );
}
