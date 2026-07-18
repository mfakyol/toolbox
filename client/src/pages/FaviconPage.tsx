import { useEffect, useState } from "react";
import { generateFavicons } from "../services/favicon.service";
import { useI18n } from "../i18n";
import {
  Panel,
  Columns,
  Dropzone,
  DropzoneHint,
  DropzonePreview,
  Field,
  Button,
  Alert,
  PageIntro,
} from "../components/ui";
import styles from "./FaviconPage.module.scss";

const PREVIEW_SIZES = [16, 32, 48, 64];

export default function FaviconPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      setError(t("favicon.notImage"));
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

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDone(false);
    const res = await generateFavicons(file);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    setLoading(false);
  }

  return (
    <>
      <PageIntro>{t("favicon.intro")}</PageIntro>

      <Columns>
        <Panel>
          <Dropzone
            onFiles={(files) => select(files[0])}
            accept="image/*"
            hasPreview={!!previewUrl}
          >
            {previewUrl ? (
              <DropzonePreview src={previewUrl} />
            ) : (
              <DropzoneHint
                icon="⭐"
                title={t("favicon.dropTitle")}
                sub={t("favicon.dropSub")}
              />
            )}
          </Dropzone>
        </Panel>

        <Panel className={styles.controls}>
          {previewUrl && (
            <Field label={t("favicon.preview")}>
              <div className={styles.previews}>
                {PREVIEW_SIZES.map((s) => (
                  <div key={s} className={styles.preview}>
                    <img src={previewUrl} alt="" style={{ width: s, height: s }} />
                    <small>
                      {s}×{s}
                    </small>
                  </div>
                ))}
              </div>
            </Field>
          )}

          <Button block onClick={generate} disabled={!file || loading}>
            {loading ? t("favicon.generating") : t("favicon.generate")}
          </Button>

          {error && <Alert>⚠️ {error}</Alert>}
          {done && <Alert tone="success">{t("favicon.done")}</Alert>}
        </Panel>
      </Columns>
    </>
  );
}
