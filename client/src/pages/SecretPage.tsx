import { useEffect, useState, type FormEvent } from "react";
import * as secretApi from "@/services/secret.service";
import type { SecretSummary } from "@/services/secret.service";
import { CopyButton } from "@/components/CopyButton";
import { createSecretSchema } from "@/schemas/secret.schema";
import { useI18n } from "@/i18n";
import {
  Panel,
  Field,
  Button,
  Badge,
  Alert,
  Checkbox,
  PageIntro,
  type BadgeTone,
} from "@/components/ui";
import styles from "./SecretPage.module.scss";

const TTL_KEYS: Record<number, string> = {
  3600: "secret.ttl1h",
  86400: "secret.ttl1d",
  604800: "secret.ttl7d",
  2592000: "secret.ttl30d",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  active: "accent",
  viewed: "success",
  expired: "neutral",
};

export default function SecretPage() {
  const { t, te, lang } = useI18n();

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
    const res = await secretApi.listSecrets();
    if (!res.success) {
      setError(te(res.code, res.error));
      return;
    }
    setHistory(res.data.secrets);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const input = {
      content,
      passphrase: passphrase || undefined,
      ttlSeconds: ttl,
      requireLogin,
    };
    const parsed = createSecretSchema.safeParse(input);
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setBusy(true);
    const res = await secretApi.createSecret(input);
    setBusy(false);
    if (!res.success) {
      setError(te(res.code, res.error));
      return;
    }
    setCreated(res.data.secret);
    setContent("");
    setPassphrase("");
    await refresh();
  }

  function reset() {
    setCreated(null);
    setError(null);
  }

  return (
    <div>
      <PageIntro>{t("secret.intro")}</PageIntro>

      {created ? (
        <Panel className={styles.result}>
          <h3>{t("secret.linkTitle")}</h3>
          <div className={styles.linkRow}>
            <input readOnly value={secretApi.secretUrl(created.token)} />
            <CopyButton text={secretApi.secretUrl(created.token)} />
          </div>
          <p className={styles.warn}>{t("secret.linkNote")}</p>
          <div className={styles.badges}>
            {created.hasPassphrase && <Badge>{t("secret.protected")}</Badge>}
            {created.requireLogin && <Badge>{t("secret.loginOnly")}</Badge>}
            <Badge tone="accent">
              {t("secret.expires")}: {fmt(created.expiresAt)}
            </Badge>
          </div>
          <div>
            <Button onClick={reset}>{t("secret.new")}</Button>
          </div>
        </Panel>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <Field label={t("secret.content")}>
            <textarea
              className={styles.textarea}
              placeholder={t("secret.placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
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

          {error && <Alert>{error}</Alert>}

          <Button type="submit" disabled={busy}>
            {busy ? t("secret.creating") : t("secret.create")}
          </Button>
        </form>
      )}

      <div className={styles.history}>
        <h3>{t("secret.history")}</h3>
        <p className={styles.historyNote}>{t("secret.historyNote")}</p>

        {history.length === 0 ? (
          <p className={styles.empty}>{t("secret.none")}</p>
        ) : (
          <table className={styles.table}>
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
                    <Badge tone={STATUS_TONE[s.status] ?? "neutral"}>
                      {t(`secret.${s.status}`)}
                    </Badge>
                    {s.hasPassphrase && <span className={styles.muted}> 🔒</span>}
                    {s.requireLogin && <span className={styles.muted}> 👤</span>}
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
