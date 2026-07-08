import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as secretApi from "../api/secret";
import type { SecretMeta } from "../api/secret";
import { CopyButton } from "../components/CopyButton";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

export default function SecretViewPage() {
  const { token = "" } = useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const [meta, setMeta] = useState<SecretMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [passphrase, setPassphrase] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    secretApi
      .getSecretMeta(token)
      .then(({ meta }) => setMeta(meta))
      .catch(() => setLoadError(t("secret.notFound")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onReveal() {
    setRevealError(null);
    setRevealing(true);
    try {
      const { content } = await secretApi.revealSecret(token, passphrase || undefined);
      setContent(content);
    } catch (err) {
      setRevealError(err instanceof Error ? err.message : String(err));
    } finally {
      setRevealing(false);
    }
  }

  function Frame({ children }: { children: React.ReactNode }) {
    return (
      <div className="secret-view-wrap">
        <div className="panel secret-view-card">
          <h2 className="auth-title">{t("secret.viewTitle")}</h2>
          {children}
        </div>
      </div>
    );
  }

  if (loading) return <Frame>{<p className="page-intro">…</p>}</Frame>;

  if (loadError || !meta) {
    return (
      <Frame>
        <div className="error">{loadError ?? t("secret.notFound")}</div>
      </Frame>
    );
  }

  // Already consumed once it's been revealed in this session.
  if (content !== null) {
    return (
      <Frame>
        <p className="secret-revealed-label">{t("secret.revealed")}</p>
        <div className="secret-content-box">
          <pre>{content}</pre>
        </div>
        <div className="secret-badges">
          <CopyButton text={content} />
        </div>
        <p className="secret-warn">{t("secret.afterView")}</p>
      </Frame>
    );
  }

  if (meta.status === "viewed") {
    return <Frame>{<div className="error">{t("secret.gone")}</div>}</Frame>;
  }
  if (meta.status === "expired") {
    return <Frame>{<div className="error">{t("secret.expiredMsg")}</div>}</Frame>;
  }

  // status === "active"
  const needsLogin = meta.requireLogin && !user;

  return (
    <Frame>
      <p className="secret-warn">{t("secret.warnOnce")}</p>

      {needsLogin ? (
        <>
          <div className="error">{t("secret.loginRequired")}</div>
          <Link className="convert-btn secret-login-link" to="/login">
            {t("secret.goLogin")}
          </Link>
        </>
      ) : (
        <>
          {meta.hasPassphrase && (
            <label className="field">
              <span>{t("secret.enterPassphrase")}</span>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </label>
          )}

          {revealError && <div className="error">{revealError}</div>}

          <button className="convert-btn" onClick={onReveal} disabled={revealing}>
            {revealing ? t("secret.revealing") : t("secret.reveal")}
          </button>
        </>
      )}
    </Frame>
  );
}
