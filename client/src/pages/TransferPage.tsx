import { useEffect, useState, type FormEvent } from "react";
import * as transferApi from "../services/transfer.service";
import type { TransferSummary } from "../services/transfer.service";
import { CopyButton } from "../components/CopyButton";
import { formatBytes } from "../utils/format";
import { createTransferSchema } from "../schemas/transfer.schema";
import { useI18n } from "../i18n";
import {
  Panel,
  Field,
  Button,
  Badge,
  Alert,
  Checkbox,
  Progress,
  PageIntro,
  Dropzone,
  DropzoneHint,
  type BadgeTone,
} from "../components/ui";
import styles from "./TransferPage.module.scss";

const TTL_KEYS: Record<number, string> = {
  3600: "secret.ttl1h",
  86400: "secret.ttl1d",
  604800: "secret.ttl7d",
  2592000: "secret.ttl30d",
};

export default function TransferPage() {
  const { t, lang } = useI18n();

  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [ttl, setTtl] = useState(604800);
  const [requireLogin, setRequireLogin] = useState(false);

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
    const res = await transferApi.listTransfers();
    if (!res.success) {
      setError(res.error);
      return;
    }
    setHistory(res.data.transfers);
  }

  useEffect(() => {
    refresh();
  }, []);

  function addFiles(list: FileList | File[]) {
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const input = {
      files,
      message: message || undefined,
      passphrase: passphrase || undefined,
      ttlSeconds: ttl,
      requireLogin,
    };
    const parsed = createTransferSchema.safeParse(input);
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setBusy(true);
    setProgress(0);
    const res = await transferApi.createTransfer(input, setProgress);
    setBusy(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setCreated(res.data.transfer);
    setFiles([]);
    setMessage("");
    setPassphrase("");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm(t("transfer.confirmDelete"))) return;
    const res = await transferApi.deleteTransfer(id);
    if (!res.success) {
      setError(res.error);
      return;
    }
    await refresh();
  }

  const statusTone = (active: boolean): BadgeTone => (active ? "accent" : "neutral");

  return (
    <div>
      <PageIntro>{t("transfer.intro")}</PageIntro>

      {created ? (
        <Panel className={styles.result}>
          <h3>{t("transfer.linkTitle")}</h3>
          <div className={styles.linkRow}>
            <input readOnly value={transferApi.transferShareUrl(created.token)} />
            <CopyButton text={transferApi.transferShareUrl(created.token)} />
          </div>
          <p className={styles.warn}>{t("transfer.linkNote")}</p>
          <div className={styles.badges}>
            {created.hasPassphrase && <Badge>🔒</Badge>}
            {created.requireLogin && <Badge>👤</Badge>}
            <Badge>
              {created.files.length} {t("transfer.files")} ·{" "}
              {formatBytes(created.totalSize)}
            </Badge>
            <Badge tone="accent">
              {t("transfer.expires")}: {fmt(created.expiresAt)}
            </Badge>
          </div>
          <div>
            <Button onClick={() => setCreated(null)}>{t("transfer.new")}</Button>
          </div>
        </Panel>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <Dropzone onFiles={addFiles} multiple>
            <DropzoneHint
              icon="📁"
              title={t("transfer.drop")}
              sub={t("transfer.dropHint")}
            />
          </Dropzone>

          {files.length > 0 && (
            <div className={styles.filelist}>
              <div className={styles.filelistHead}>
                <span>
                  {t("transfer.selected", { n: files.length })} ·{" "}
                  {formatBytes(totalSize)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                  {t("transfer.clear")}
                </Button>
              </div>
              <ul className={styles.list}>
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <span className={styles.fileName}>{f.name}</span>
                    <span className={styles.muted}>{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Field label={t("transfer.message")}>
            <textarea
              className={styles.message}
              placeholder={t("transfer.messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          <div className={styles.formRow}>
            <Field label={t("secret.ttl")}>
              <select value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
                {Object.entries(TTL_KEYS).map(([sec, key]) => (
                  <option key={sec} value={sec}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("secret.passphrase")}>
              <input
                type="text"
                placeholder={t("secret.passphrasePlaceholder")}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </Field>
          </div>

          <Checkbox checked={requireLogin} onChange={setRequireLogin}>
            {t("secret.requireLogin")}
          </Checkbox>

          {busy && <Progress value={progress} />}

          {error && <Alert>{error}</Alert>}

          <Button type="submit" disabled={busy || files.length === 0}>
            {busy
              ? t("transfer.uploading", { p: progress })
              : t("transfer.upload")}
          </Button>
        </form>
      )}

      <div className={styles.history}>
        <h3>{t("transfer.history")}</h3>
        {history.length === 0 ? (
          <p className={styles.empty}>{t("transfer.none")}</p>
        ) : (
          <table className={styles.table}>
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
                    <Badge tone={statusTone(tr.status === "active")}>
                      {tr.status === "active"
                        ? t("transfer.active")
                        : t("transfer.expired")}
                    </Badge>
                    {tr.hasPassphrase && <span className={styles.muted}> 🔒</span>}
                    {tr.requireLogin && <span className={styles.muted}> 👤</span>}
                  </td>
                  <td>{tr.files.length}</td>
                  <td>{formatBytes(tr.totalSize)}</td>
                  <td>{tr.downloadCount}</td>
                  <td>{fmt(tr.expiresAt)}</td>
                  <td className={styles.rowActions}>
                    {tr.status === "active" && (
                      <CopyButton text={transferApi.transferShareUrl(tr.token)} />
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onDelete(tr.id)}>
                      {t("transfer.delete")}
                    </Button>
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
