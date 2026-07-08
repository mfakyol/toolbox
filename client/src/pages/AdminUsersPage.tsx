import { useEffect, useState, type FormEvent } from "react";
import * as authApi from "../api/auth";
import type { AuthUser, Role } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { Button, Field, Badge, Alert } from "../components/ui";
import styles from "./AdminUsersPage.module.scss";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { t } = useI18n();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const { users } = await authApi.listUsers();
      setUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await authApi.createUser(email, password, role);
      setNotice(t("admin.created"));
      setEmail("");
      setPassword("");
      setRole("user");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setError(null);
    try {
      await authApi.deleteUser(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <h2 className={styles.title}>{t("admin.title")}</h2>

      <form className={styles.form} onSubmit={onCreate}>
        <h3>{t("admin.newUser")}</h3>
        <div className={styles.formRow}>
          <Field label={t("auth.email")}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t("auth.password")}>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={t("admin.role")}>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="user">{t("admin.roleUser")}</option>
              <option value="admin">{t("admin.roleAdmin")}</option>
            </select>
          </Field>
        </div>

        {error && <Alert>{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <Button type="submit" disabled={busy}>
          {busy ? t("admin.creating") : t("admin.create")}
        </Button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("admin.emailCol")}</th>
            <th>{t("admin.roleCol")}</th>
            <th>{t("admin.statusCol")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.email}
                {u.id === me?.id && (
                  <span className={styles.muted}> {t("admin.you")}</span>
                )}
              </td>
              <td>
                <Badge tone={u.role === "admin" ? "accent" : "neutral"}>
                  {u.role === "admin" ? t("admin.roleAdmin") : t("admin.roleUser")}
                </Badge>
              </td>
              <td>
                {u.mustChangePassword ? t("admin.mustChange") : t("admin.active")}
              </td>
              <td>
                {u.id !== me?.id && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(u.id)}>
                    {t("admin.delete")}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
