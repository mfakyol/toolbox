import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as transferApi from "../api/transfer";
import type { TransferSummary } from "../api/transfer";
import { formatBytes } from "../utils/format";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { Panel, Field, Button, LinkButton, Alert, PageIntro } from "../components/ui";
import styles from "./TransferDownloadPage.module.scss";

export default function TransferDownloadPage() {
  const { token = "" } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const [transfer, setTransfer] = useState<TransferSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [passphrase, setPassphrase] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    transferApi
      .getTransferMeta(token)
      .then(({ transfer }) => setTransfer(transfer))
      .catch(() => setLoadError(t("transfer.notFound")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onDownload() {
    setDownloadError(null);
    setDownloading(true);
    try {
      // Validate access first, then hand off to a native browser download.
      await transferApi.verifyTransfer(token, passphrase || undefined);
      window.location.href = transferApi.transferDownloadUrl(
        token,
        passphrase || undefined
      );
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : String(err));
    } finally {
      setDownloading(false);
    }
  }

  function Frame({ children }: { children: React.ReactNode }) {
    return (
      <div className={styles.wrap}>
        <Panel className={styles.card}>
          <h2 className={styles.title}>{t("transfer.viewTitle")}</h2>
          {children}
        </Panel>
      </div>
    );
  }

  if (loading) return <Frame>{<PageIntro>…</PageIntro>}</Frame>;

  if (loadError || !transfer) {
    return (
      <Frame>
        <Alert>{loadError ?? t("transfer.notFound")}</Alert>
      </Frame>
    );
  }

  if (transfer.status === "expired") {
    return <Frame>{<Alert>{t("transfer.expiredMsg")}</Alert>}</Frame>;
  }

  const needsLogin = transfer.requireLogin && !user;
  const multiple = transfer.files.length > 1;

  return (
    <Frame>
      {transfer.message && <p className={styles.viewMessage}>{transfer.message}</p>}

      <div className={styles.filelist}>
        <ul className={styles.list}>
          {transfer.files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.muted}>{formatBytes(f.size)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          {t("transfer.totalLabel")}: {formatBytes(transfer.totalSize)}
        </div>
      </div>

      {needsLogin ? (
        <>
          <Alert>{t("transfer.loginRequired")}</Alert>
          <LinkButton block href="/login">
            {t("transfer.goLogin")}
          </LinkButton>
        </>
      ) : (
        <>
          {transfer.hasPassphrase && (
            <Field label={t("transfer.enterPassphrase")}>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </Field>
          )}

          {downloadError && <Alert>{downloadError}</Alert>}

          <Button onClick={onDownload} disabled={downloading}>
            {multiple ? t("transfer.downloadAll") : t("transfer.download")}
          </Button>
        </>
      )}
    </Frame>
  );
}
