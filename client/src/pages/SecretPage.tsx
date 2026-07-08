import { useEffect, useState, type FormEvent } from "react";
import * as secretApi from "../api/secret";
import type { SecretSummary } from "../api/secret";
import { CopyButton } from "../components/CopyButton";
import { useI18n } from "../i18n";

const TTL_KEYS: Record<number, string> = {
  3600: "secret.ttl1h",
  86400: "secret.ttl1d",
  604800: "secret.ttl7d",
  2592000: "secret.ttl30d",
};

export default function SecretPage() {
  const { t, lang } = useI18n();

  const [content, setContent] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [ttl, setTtl] = useState(604800);
  const [requireLogin, setRequireLogin] = useState(false);

  const [created, setCreated] = useState<SecretSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<SecretSummary[]>([]);

  function fmt(date: string | null) {
    return date ? new Date(date).toLocaleString(lang) : "—";
  }

  async function refresh() {
    try {
      const { secrets } = await secretApi.listSecrets();
      setHistory(secrets);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { secret } = await secretApi.createSecret({
        content,
        passphrase: passphrase || undefined,
        ttlSeconds: ttl,
        requireLogin,
      });
      setCreated(secret);
      setContent("");
      setPassphrase("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setCreated(null);
    setError(null);
  }

  function statusLabel(s: SecretSummary) {
    return t(`secret.${s.status}`);
  }

  return (
    <div>
      <p className="page-intro">{t("secret.intro")}</p>

      {created ? (
        <div className="panel secret-result">
          <h3>{t("secret.linkTitle")}</h3>
          <div className="secret-link-row">
            <input readOnly value={secretApi.secretUrl(created.token)} />
            <CopyButton text={secretApi.secretUrl(created.token)} />
          </div>
          <p className="secret-warn">{t("secret.linkNote")}</p>
          <div className="secret-badges">
            {created.hasPassphrase && (
              <span className="chip">{t("secret.protected")}</span>
            )}
            {created.requireLogin && (
              <span className="chip">{t("secret.loginOnly")}</span>
            )}
            <span className="chip">
              {t("secret.expires")}: {fmt(created.expiresAt)}
            </span>
          </div>
          <button className="convert-btn" onClick={reset}>
            {t("secret.new")}
          </button>
        </div>
      ) : (
        <form className="panel secret-form" onSubmit={onSubmit}>
          <label className="field">
            <span>{t("secret.content")}</span>
            <textarea
              className="secret-textarea"
              placeholder={t("secret.placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
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

          {error && <div className="error">{error}</div>}

          <button className="convert-btn" type="submit" disabled={busy}>
            {busy ? t("secret.creating") : t("secret.create")}
          </button>
        </form>
      )}

      <div className="secret-history">
        <h3>{t("secret.history")}</h3>
        <p className="secret-history-note">{t("secret.historyNote")}</p>

        {history.length === 0 ? (
          <p className="empty">{t("secret.none")}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.statusCol")}</th>
                <th>{t("secret.created")}</th>
                <th>{t("secret.expires")}</th>
                <th>{t("secret.viewedAt")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className={`badge secret-status-${s.status}`}>
                      {statusLabel(s)}
                    </span>
                    {s.hasPassphrase && <span className="muted"> 🔒</span>}
                    {s.requireLogin && <span className="muted"> 👤</span>}
                  </td>
                  <td>{fmt(s.createdAt)}</td>
                  <td>{fmt(s.expiresAt)}</td>
                  <td>{fmt(s.viewedAt)}</td>
                  <td>
                    {s.status === "active" && (
                      <CopyButton text={secretApi.secretUrl(s.token)} />
                    )}
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
