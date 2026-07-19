import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useAuth } from "@/stores/auth.store";
import { LangSwitcher } from "@/components/LangSwitcher";
import styles from "./MainLayout.module.scss";

// Grouped sidebar nav. `raw` labels are technical/proper names (not translated);
// everything else is an i18n key.
interface NavItem {
  to: string;
  label: string;
  raw?: boolean;
  end?: boolean;
}
const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "nav.grpMedia",
    items: [
      { to: "/", label: "nav.image", end: true },
      { to: "/font", label: "nav.font" },
      { to: "/favicon", label: "nav.favicon" },
      { to: "/qr", label: "nav.qr" },
    ],
  },
  {
    group: "nav.grpTools",
    items: [
      { to: "/json", label: "nav.json" },
      { to: "/tools/base64", label: "Base64", raw: true },
      { to: "/tools/url", label: "URL", raw: true },
      { to: "/tools/jwt", label: "JWT", raw: true },
      { to: "/tools/hash", label: "Hash", raw: true },
      { to: "/tools/uuid", label: "UUID", raw: true },
      { to: "/tools/diff", label: "Diff", raw: true },
      { to: "/tools/json", label: "JSON", raw: true },
    ],
  },
  {
    group: "nav.grpShare",
    items: [
      { to: "/secret", label: "nav.secret" },
      { to: "/transfer", label: "nav.transfer" },
    ],
  },
  {
    group: "nav.grpDev",
    items: [{ to: "/playground", label: "nav.play" }],
  },
];

// Flat route → title lookup (reuses the nav labels) so every page shows its
// name — important on mobile where the sidebar is collapsed.
const TITLES: Record<string, NavItem> = Object.fromEntries([
  ...NAV.flatMap((s) => s.items.map((i) => [i.to, i] as const)),
  ["/admin/users", { to: "/admin/users", label: "auth.admin" }],
]);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.active : ""}`;

// Strip a leading emoji/pictograph so sidebar items read as clean, aligned text.
const stripIcon = (s: string) =>
  s.replace(/^[^\p{L}\p{N}]+/u, "");

export function MainLayout() {
  const { t } = useI18n();
  const { user, logout, authRequired } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  const titleItem = TITLES[pathname];
  const pageTitle = titleItem
    ? titleItem.raw
      ? titleItem.label
      : stripIcon(t(titleItem.label))
    : "";

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.shell}>
      {/* Mobile top bar — hidden on desktop */}
      <header className={styles.topbar}>
        <button
          className={styles.menuBtn}
          onClick={() => setNavOpen(true)}
          aria-label={t("a11y.menu")}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={styles.topbarBrand}>{t("app.title")}</div>
      </header>

      {navOpen && <div className={styles.backdrop} onClick={closeNav} />}

      <aside className={`${styles.sidebar} ${navOpen ? styles.open : ""}`}>
        <div className={styles.brand}>{t("app.title")}</div>

        <nav className={styles.nav}>
          {NAV.map((section) => (
            <div className={styles.group} key={section.group}>
              <div className={styles.groupLabel}>{t(section.group)}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                  onClick={closeNav}
                >
                  {item.raw ? item.label : stripIcon(t(item.label))}
                </NavLink>
              ))}
            </div>
          ))}

          {authRequired && user?.role === "admin" && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>{t("nav.grpAdmin")}</div>
              <NavLink
                to="/admin/users"
                className={navLinkClass}
                onClick={closeNav}
              >
                {stripIcon(t("auth.admin"))}
              </NavLink>
            </div>
          )}
        </nav>

        <div className={styles.footer}>
          <LangSwitcher />
          {authRequired && user && (
            <div className={styles.account}>
              <span className={styles.userEmail}>{user.email}</span>
              <button className={styles.logoutBtn} onClick={onLogout}>
                {t("auth.logout")}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
