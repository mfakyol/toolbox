import { useEffect, useState, type FormEvent } from "react";
import * as authApi from "../api/auth";
import type { AuthUser, Role } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";

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
      <h2>{t("admin.title")}</h2>

      <form className="panel admin-form" onSubmit={onCreate}>
        <h3>{t("admin.newUser")}</h3>
        <div className="admin-form-row">
          <label className="field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("auth.password")}</span>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("admin.role")}</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="user">{t("admin.roleUser")}</option>
              <option value="admin">{t("admin.roleAdmin")}</option>
            </select>
          </label>
        </div>

        {error && <div className="error">{error}</div>}
        {notice && <div className="notice">{notice}</div>}

        <button className="convert-btn" type="submit" disabled={busy}>
          {busy ? t("admin.creating") : t("admin.create")}
        </button>
      </form>

      <table className="admin-table">
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
                {u.id === me?.id && <span className="muted"> {t("admin.you")}</span>}
              </td>
              <td>
                <span className="badge">
                  {u.role === "admin" ? t("admin.roleAdmin") : t("admin.roleUser")}
                </span>
              </td>
              <td>
                {u.mustChangePassword ? t("admin.mustChange") : t("admin.active")}
              </td>
              <td>
                {u.id !== me?.id && (
                  <button className="ghost-btn" onClick={() => onDelete(u.id)}>
                    {t("admin.delete")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
