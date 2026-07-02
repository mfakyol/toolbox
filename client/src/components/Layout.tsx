import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../i18n";
import { LangSwitcher } from "./LangSwitcher";

export function Layout() {
  const { t } = useI18n();

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <h1>{t("app.title")}</h1>
          <LangSwitcher />
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
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
