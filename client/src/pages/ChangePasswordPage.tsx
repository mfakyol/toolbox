import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

// Forced first-login password change. Reused as a normal change-password form
// too, but the flow lands here automatically while mustChangePassword is set.
export default function ChangePasswordPage() {
  const { user, loading, changePassword } = useAuth();
  const { t } = useI18n();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && !user) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (next.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (next !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await changePassword(current, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  // After a successful change the flag clears → leave the forced flow.
  if (user && !user.mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={onSubmit}>
        <h2 className="auth-title">{t("auth.changeTitle")}</h2>
        <p className="page-intro">{t("auth.changeSub")}</p>

        <label className="field">
          <span>{t("auth.currentPassword")}</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>

        <label className="field">
          <span>{t("auth.newPassword")}</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>

        <label className="field">
          <span>{t("auth.confirmPassword")}</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="convert-btn" type="submit" disabled={busy}>
          {busy ? t("auth.saving") : t("auth.save")}
        </button>
      </form>
    </div>
  );
}
