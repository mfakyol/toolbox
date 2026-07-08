import { useEffect, useRef, useState, type FormEvent, type DragEvent } from "react";
import * as transferApi from "../api/transfer";
import type { TransferSummary } from "../api/transfer";
import { CopyButton } from "../components/CopyButton";
import { formatBytes } from "../utils/format";
import { useI18n } from "../i18n";

const TTL_KEYS: Record<number, string> = {
  3600: "secret.ttl1h",
  86400: "secret.ttl1d",
  604800: "secret.ttl7d",
  2592000: "secret.ttl30d",
};

export default function TransferPage() {
  const { t, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [ttl, setTtl] = useState(604800);
  const [requireLogin, setRequireLogin] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<TransferSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TransferSummary[]>([]);

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  function fmt(date: string) {
    return new Date(date).toLocaleString(lang);
  }

  async function refresh() {
    try {
      const { transfers } = await transferApi.listTransfers();
      setHistory(transfers);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const { transfer } = await transferApi.createTransfer(
        {
          files,
          message: message || undefined,
          passphrase: passphrase || undefined,
          ttlSeconds: ttl,
          requireLogin,
        },
        setProgress
      );
      setCreated(transfer);
      setFiles([]);
      setMessage("");
      setPassphrase("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(t("transfer.confirmDelete"))) return;
    try {
      await transferApi.deleteTransfer(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <p className="page-intro">{t("transfer.intro")}</p>

      {created ? (
        <div className="panel secret-result">
          <h3>{t("transfer.linkTitle")}</h3>
          <div className="secret-link-row">
            <input readOnly value={transferApi.transferShareUrl(created.token)} />
            <CopyButton text={transferApi.transferShareUrl(created.token)} />
          </div>
          <p className="secret-warn">{t("transfer.linkNote")}</p>
          <div className="secret-badges">
            {created.hasPassphrase && <span className="chip">🔒</span>}
            {created.requireLogin && <span className="chip">👤</span>}
            <span className="chip">
              {created.files.length} {t("transfer.files")} ·{" "}
              {formatBytes(created.totalSize)}
            </span>
            <span className="chip">
              {t("transfer.expires")}: {fmt(created.expiresAt)}
            </span>
          </div>
          <button className="convert-btn" onClick={() => setCreated(null)}>
            {t("transfer.new")}
          </button>
        </div>
      ) : (
        <form className="panel secret-form" onSubmit={onSubmit}>
          <div
            className={`dropzone ${dragging ? "dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <div className="dropzone-hint">
              <strong>{t("transfer.drop")}</strong>
              <span>{t("transfer.dropHint")}</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="transfer-filelist">
              <div className="transfer-filelist-head">
                <span>
                  {t("transfer.selected", { n: files.length })} ·{" "}
                  {formatBytes(totalSize)}
                </span>
                <button
                  type="button"
                  className="ghost-btn slim"
                  onClick={() => setFiles([])}
                >
                  {t("transfer.clear")}
                </button>
              </div>
              <ul>
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <span className="transfer-file-name">{f.name}</span>
                    <span className="muted">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="field">
            <span>{t("transfer.message")}</span>
            <textarea
              className="secret-textarea transfer-message"
              placeholder={t("transfer.messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <div className="secret-form-row">
            <label className="field">
              <span>{t("secret.ttl")}</span>
              <select value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
                {Object.entries(TTL_KEYS).map(([sec, key]) => (
                  <option key={sec} value={sec}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("secret.passphrase")}</span>
              <input
                type="text"
                placeholder={t("secret.passphrasePlaceholder")}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </label>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={requireLogin}
              onChange={(e) => setRequireLogin(e.target.checked)}
            />
            {t("secret.requireLogin")}
          </label>

          {busy && (
            <div className="transfer-progress">
              <div
                className="transfer-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button
            className="convert-btn"
            type="submit"
            disabled={busy || files.length === 0}
          >
            {busy
              ? t("transfer.uploading", { p: progress })
              : t("transfer.upload")}
          </button>
        </form>
      )}

      <div className="secret-history">
        <h3>{t("transfer.history")}</h3>
        {history.length === 0 ? (
          <p className="empty">{t("transfer.none")}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.statusCol")}</th>
                <th>{t("transfer.files")}</th>
                <th>{t("transfer.size")}</th>
                <th>{t("transfer.downloads")}</th>
                <th>{t("transfer.expires")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {history.map((tr) => (
                <tr key={tr.id}>
                  <td>
                    <span className={`badge secret-status-${tr.status === "active" ? "active" : "expired"}`}>
                      {tr.status === "active"
                        ? t("transfer.active")
                        : t("transfer.expired")}
                    </span>
                    {tr.hasPassphrase && <span className="muted"> 🔒</span>}
                    {tr.requireLogin && <span className="muted"> 👤</span>}
                  </td>
                  <td>{tr.files.length}</td>
                  <td>{formatBytes(tr.totalSize)}</td>
                  <td>{tr.downloadCount}</td>
                  <td>{fmt(tr.expiresAt)}</td>
                  <td className="transfer-row-actions">
                    {tr.status === "active" && (
                      <CopyButton text={transferApi.transferShareUrl(tr.token)} />
                    )}
                    <button className="ghost-btn slim" onClick={() => onDelete(tr.id)}>
                      {t("transfer.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
