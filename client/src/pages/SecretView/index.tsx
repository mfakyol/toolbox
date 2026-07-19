import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as secretApi from "@/services/secret.service";
import type { SecretMeta } from "@/services/secret.service";
import { CopyButton } from "@/components/CopyButton";
import { useAuth } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import { Panel, Field, Button, LinkButton, Alert, PageIntro } from "@/components/ui";
import styles from "./styles.module.scss";

export default function SecretViewPage() {
  const { token = "" } = useParams();
  const { t, te } = useI18n();
  const { user } = useAuth();

  const [meta, setMeta] = useState<SecretMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [passphrase, setPassphrase] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    secretApi.getSecretMeta(token).then((res) => {
      if (res.success) setMeta(res.data.meta);
      else setLoadError(t("secret.notFound"));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onReveal() {
    setRevealError(null);
    setRevealing(true);
    const res = await secretApi.revealSecret(token, passphrase || undefined);
    setRevealing(false);
    if (!res.success) {
      setRevealError(te(res.code, res.error));
      return;
    }
    setContent(res.data.content);
  }

  function Frame({ children }: { children: React.ReactNode }) {
    return (
      <div className={styles.wrap}>
        <Panel className={styles.card}>
          <h2 className={styles.title}>{t("secret.viewTitle")}</h2>
          {children}
        </Panel>
      </div>
    );
  }

  if (loading) return <Frame>{<PageIntro>…</PageIntro>}</Frame>;

  if (loadError || !meta) {
    return (
      <Frame>
        <Alert>{loadError ?? t("secret.notFound")}</Alert>
      </Frame>
    );
  }

  // Already consumed once it's been revealed in this session.
  if (content !== null) {
    return (
      <Frame>
        <p className={styles.revealedLabel}>{t("secret.revealed")}</p>
        <div className={styles.contentBox}>
          <pre>{content}</pre>
        </div>
        <div className={styles.badges}>
          <CopyButton text={content} />
        </div>
        <p className={styles.warn}>{t("secret.afterView")}</p>
      </Frame>
    );
  }

  if (meta.status === "viewed") {
    return <Frame>{<Alert>{t("secret.gone")}</Alert>}</Frame>;
  }
  if (meta.status === "expired") {
    return <Frame>{<Alert>{t("secret.expiredMsg")}</Alert>}</Frame>;
  }

  // status === "active"
  const needsLogin = meta.requireLogin && !user;

  return (
    <Frame>
      <p className={styles.warn}>{t("secret.warnOnce")}</p>

      {needsLogin ? (
        <>
          <Alert>{t("secret.loginRequired")}</Alert>
          <LinkButton block href="/login">
            {t("secret.goLogin")}
          </LinkButton>
        </>
      ) : (
        <>
          {meta.hasPassphrase && (
            <Field label={t("secret.enterPassphrase")}>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </Field>
          )}

          {revealError && <Alert>{revealError}</Alert>}

          <Button onClick={onReveal} disabled={revealing}>
            {revealing ? t("secret.revealing") : t("secret.reveal")}
          </Button>
        </>
      )}
    </Frame>
  );
}
