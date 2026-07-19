import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as transferApi from "@/services/transfer.service";
import type { TransferSummary } from "@/services/transfer.service";
import { formatBytes } from "@/utils/format";
import { useAuth } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import { PublicHeader } from "@/layouts/PublicHeader";
import {
  Panel,
  Field,
  Button,
  LinkButton,
  Alert,
  PageIntro,
} from "@/components/ui";
import styles from "./styles.module.scss";

export default function TransferDownloadPage() {
  const { token = "" } = useParams();
  const { t, te } = useI18n();
  const { user } = useAuth();

  const [transfer, setTransfer] = useState<TransferSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [passphrase, setPassphrase] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    transferApi.getTransferMeta(token).then((res) => {
      if (res.success) setTransfer(res.data.transfer);
      else setLoadError(t("transfer.notFound"));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onDownload() {
    setDownloadError(null);
    setDownloading(true);
    // Validate access first, then hand off to a native browser download.
    const res = await transferApi.verifyTransfer(
      token,
      passphrase || undefined,
    );
    setDownloading(false);
    if (!res.success) {
      setDownloadError(te(res.code, res.error));
      return;
    }
    window.location.href = transferApi.transferDownloadUrl(
      token,
      passphrase || undefined,
    );
  }

  function Frame({ children }: { children: React.ReactNode }) {
    return (
      <>
        <PublicHeader />
        <div className={styles.wrap}>
          <Panel className={styles.card}>
            <h2 className={styles.title}>{t("transfer.viewTitle")}</h2>
            {children}
          </Panel>
        </div>
      </>
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
      {transfer.message && (
        <p className={styles.viewMessage}>{transfer.message}</p>
      )}

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
