import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useAuth } from "@/stores/auth.store";
import { LangSwitcher } from "@/components/LangSwitcher";
import styles from "./styles.module.scss";

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

const TITLES: Record<string, NavItem> = Object.fromEntries([
  ...NAV.flatMap((s) => s.items.map((i) => [i.to, i] as const)),
  ["/admin/users", { to: "/admin/users", label: "auth.admin" }],
]);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.active : ""}`;

const stripIcon = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, "");

export function MainLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
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
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuBtn}
            onClick={() => setNavOpen(true)}
            aria-label={t("a11y.menu")}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={styles.brand}>{t("app.title")}</div>
        </div>

        <div className={styles.headerRight}>
          <LangSwitcher />
          {user ? (
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button className={styles.logoutBtn} onClick={onLogout}>
                {t("auth.logout")}
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              {t("auth.login")}
            </Link>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {navOpen && <div className={styles.backdrop} onClick={closeNav} />}

        <aside className={`${styles.sidebar} ${navOpen ? styles.open : ""}`}>
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

            {user?.role === "admin" && (
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
        </aside>

        <main className={styles.main}>
          <div className={styles.mainInner}>
            {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
