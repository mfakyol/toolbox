import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { loginSchema } from "@/schemas/auth.schema";
import { useI18n } from "@/i18n";
import { Button, Field, PageIntro, Alert, Checkbox } from "@/components/ui";
import styles from "./Auth.module.scss";

export default function LoginPage() {
  const { user, loading, authRequired, login } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Auth disabled → there is no login; send everyone to the app.
  if (!loading && !authRequired) return <Navigate to="/" replace />;

  // Already logged in → bounce to the app (or the forced password change).
  if (!loading && user) {
    return <Navigate to={user.mustChangePassword ? "/change-password" : "/"} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password, rememberMe });
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setBusy(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2 className={styles.title}>{t("auth.loginTitle")}</h2>
        <PageIntro>{t("auth.loginSub")}</PageIntro>

        <Field label={t("auth.email")}>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label={t("auth.password")}>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Checkbox checked={rememberMe} onChange={setRememberMe}>
          {t("auth.rememberMe")}
        </Checkbox>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" block disabled={busy}>
          {busy ? t("auth.loggingIn") : t("auth.login")}
        </Button>
      </form>
    </div>
  );
}
