import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useAuth } from "@/stores/auth.store";
import { LangSwitcher } from "@/components/LangSwitcher";
import styles from "./MainLayout.module.scss";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.active : ""}`;

export function MainLayout() {
  const { t } = useI18n();
  const { user, logout, authRequired } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t("app.title")}</h1>
          <div className={styles.actions}>
            <LangSwitcher />
            {authRequired && user && (
              <>
                <span className={styles.userEmail}>{user.email}</span>
                <button className={styles.logoutBtn} onClick={onLogout}>
                  {t("auth.logout")}
                </button>
              </>
            )}
          </div>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.image")}
          </NavLink>
          <NavLink to="/font" className={navLinkClass}>
            {t("nav.font")}
          </NavLink>
          <NavLink to="/favicon" className={navLinkClass}>
            {t("nav.favicon")}
          </NavLink>
          <NavLink to="/json" className={navLinkClass}>
            {t("nav.json")}
          </NavLink>
          <NavLink to="/tools" className={navLinkClass}>
            {t("nav.tools")}
          </NavLink>
          <NavLink to="/secret" className={navLinkClass}>
            {t("nav.secret")}
          </NavLink>
          <NavLink to="/transfer" className={navLinkClass}>
            {t("nav.transfer")}
          </NavLink>
          <NavLink to="/playground" className={navLinkClass}>
            {t("nav.play")}
          </NavLink>
          {authRequired && user?.role === "admin" && (
            <NavLink to="/admin/users" className={navLinkClass}>
              {t("auth.admin")}
            </NavLink>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
