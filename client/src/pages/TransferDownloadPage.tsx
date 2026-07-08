import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as transferApi from "../api/transfer";
import type { TransferSummary } from "../api/transfer";
import { formatBytes } from "../utils/format";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

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
      <div className="secret-view-wrap">
        <div className="panel secret-view-card">
          <h2 className="auth-title">{t("transfer.viewTitle")}</h2>
          {children}
        </div>
      </div>
    );
  }

  if (loading) return <Frame>{<p className="page-intro">…</p>}</Frame>;

  if (loadError || !transfer) {
    return (
      <Frame>
        <div className="error">{loadError ?? t("transfer.notFound")}</div>
      </Frame>
    );
  }

  if (transfer.status === "expired") {
    return <Frame>{<div className="error">{t("transfer.expiredMsg")}</div>}</Frame>;
  }

  const needsLogin = transfer.requireLogin && !user;
  const multiple = transfer.files.length > 1;

  return (
    <Frame>
      {transfer.message && <p className="transfer-view-message">{transfer.message}</p>}

      <div className="transfer-filelist">
        <ul>
          {transfer.files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span className="transfer-file-name">{f.name}</span>
              <span className="muted">{formatBytes(f.size)}</span>
            </li>
          ))}
        </ul>
        <div className="transfer-filelist-total">
          {t("transfer.totalLabel")}: {formatBytes(transfer.totalSize)}
        </div>
      </div>

      {needsLogin ? (
        <>
          <div className="error">{t("transfer.loginRequired")}</div>
          <Link className="convert-btn secret-login-link" to="/login">
            {t("transfer.goLogin")}
          </Link>
        </>
      ) : (
        <>
          {transfer.hasPassphrase && (
            <label className="field">
              <span>{t("transfer.enterPassphrase")}</span>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </label>
          )}

          {downloadError && <div className="error">{downloadError}</div>}

          <button className="convert-btn" onClick={onDownload} disabled={downloading}>
            {multiple ? t("transfer.downloadAll") : t("transfer.download")}
          </button>
        </>
      )}
    </Frame>
  );
}
