import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../auth/AuthContext";
import { LangSwitcher } from "./LangSwitcher";

export function Layout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <h1>{t("app.title")}</h1>
          <div className="header-actions">
            <LangSwitcher />
            {user && (
              <>
                <span className="user-email">{user.email}</span>
                <button className="ghost-btn" onClick={onLogout}>
                  {t("auth.logout")}
                </button>
              </>
            )}
          </div>
        </div>
        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.image")}
          </NavLink>
          <NavLink
            to="/font"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.font")}
          </NavLink>
          <NavLink
            to="/favicon"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.favicon")}
          </NavLink>
          <NavLink
            to="/json"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.json")}
          </NavLink>
          <NavLink
            to="/tools"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.tools")}
          </NavLink>
          <NavLink
            to="/secret"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.secret")}
          </NavLink>
          <NavLink
            to="/transfer"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.transfer")}
          </NavLink>
          <NavLink
            to="/playground"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {t("nav.play")}
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
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
