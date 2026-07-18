import { useCallback, useState } from "react";
import { BatchDropzone } from "../components/batch/BatchDropzone";
import { JobList } from "../components/batch/JobList";
import { BatchToolbar } from "../components/batch/BatchToolbar";
import { useBatchConverter } from "../hooks/useBatchConverter";
import { convertFont } from "../services/font.service";
import { useI18n } from "../i18n";
import { FONT_FORMATS, type FontFormat } from "../types";
import { Panel, Columns, Field, Chips, PageIntro, Alert } from "../components/ui";
import styles from "./ToolPage.module.scss";

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
      <PageIntro>{t("font.intro")}</PageIntro>

      <Columns>
        <Panel>
          <BatchDropzone
            accept=".ttf,.otf,.woff,.woff2"
            hintTitle={t("font.dropTitle")}
            hintSub={t("font.dropSub")}
            onFiles={batch.addFiles}
          />
          {batch.error && <Alert>⚠️ {batch.error}</Alert>}
          <JobList jobs={batch.jobs} showThumb={false} onRemove={batch.removeJob} />
        </Panel>

        <Panel className={styles.controls}>
          <Field label={t("controls.format")}>
            <Chips
              options={FONT_FORMATS}
              value={format}
              onChange={setFormat}
              render={(f) => f.toUpperCase()}
            />
          </Field>

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
        </Panel>
      </Columns>
    </>
  );
}
