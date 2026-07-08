import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

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
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={onSubmit}>
        <h2 className="auth-title">{t("auth.loginTitle")}</h2>
        <p className="page-intro">{t("auth.loginSub")}</p>

        <label className="field">
          <span>{t("auth.email")}</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>{t("auth.password")}</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          {t("auth.rememberMe")}
        </label>

        {error && <div className="error">{error}</div>}

        <button className="convert-btn" type="submit" disabled={busy}>
          {busy ? t("auth.loggingIn") : t("auth.login")}
        </button>
      </form>
    </div>
  );
}
