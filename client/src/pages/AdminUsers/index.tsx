import { useEffect, useState, type FormEvent } from "react";
import * as authApi from "@/services/auth.service";
import type { AuthUser, Role } from "@/services/auth.service";
import { useAuth } from "@/stores/auth.store";
import { createUserSchema } from "@/schemas/auth.schema";
import { useI18n } from "@/i18n";
import { Button, Field, Badge, Alert, Select } from "@/components/ui";
import styles from "./styles.module.scss";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { t, te } = useI18n();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await authApi.listUsers();
    if (!res.success) {
      setError(te(res.code, res.error));
      return;
    }
    setUsers(res.data.users);
  }

  useEffect(() => {
    refresh();
    // Load the user list once on mount; intentionally not re-run on refresh identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = createUserSchema.safeParse({ email, password, role });
    if (!parsed.success) {
      setError(t(parsed.error.issues[0].message));
      return;
    }

    setBusy(true);
    const res = await authApi.createUser(email, password, role);
    setBusy(false);
    if (!res.success) {
      setError(te(res.code, res.error));
      return;
    }
    setNotice(t("admin.created"));
    setEmail("");
    setPassword("");
    setRole("user");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setError(null);
    const res = await authApi.deleteUser(id);
    if (!res.success) {
      setError(te(res.code, res.error));
      return;
    }
    await refresh();
  }

  return (
    <div>
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
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="user">{t("admin.roleUser")}</option>
              <option value="admin">{t("admin.roleAdmin")}</option>
            </Select>
          </Field>
        </div>

        {error && <Alert>{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <Button type="submit" disabled={busy}>
          {busy ? t("admin.creating") : t("admin.create")}
        </Button>
      </form>

      <div className={styles.tableWrap}>
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
    </div>
  );
}
