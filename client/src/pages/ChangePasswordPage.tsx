import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { ApiError } from "@/services/result";
import { changePasswordSchema } from "@/schemas/auth.schema";
import { useI18n } from "@/i18n";
import { Button, Field, PageIntro, Alert } from "@/components/ui";
import styles from "./Auth.module.scss";

// Forced first-login password change. Reused as a normal change-password form
// too, but the flow lands here automatically while mustChangePassword is set.
export default function ChangePasswordPage() {
  const { user, loading, changePassword } = useAuth();
  const { t, te } = useI18n();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && !user) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = changePasswordSchema.safeParse({ current, next, confirm });
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setBusy(true);
    try {
      await changePassword(current, next);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;
      setError(te(code, err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  // After a successful change the flag clears → leave the forced flow.
  if (user && !user.mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2 className={styles.title}>{t("auth.changeTitle")}</h2>
        <PageIntro>{t("auth.changeSub")}</PageIntro>

        <Field label={t("auth.currentPassword")}>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>

        <Field label={t("auth.newPassword")}>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>

        <Field label={t("auth.confirmPassword")}>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" block disabled={busy}>
          {busy ? t("auth.saving") : t("auth.save")}
        </Button>
      </form>
    </div>
  );
}
