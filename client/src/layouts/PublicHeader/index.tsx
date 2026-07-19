import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";
import styles from "./styles.module.scss";

export function PublicHeader() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const showLogin = pathname !== "/login" && pathname !== "/change-password";

  return (
    <header className={styles.header}>
      <div className={styles.brand}>{t("app.title")}</div>
      <div className={styles.right}>
        <LangSwitcher />
        {showLogin && (
          <Link to="/login" className={styles.loginBtn}>
            {t("auth.login")}
          </Link>
        )}
      </div>
    </header>
  );
}
