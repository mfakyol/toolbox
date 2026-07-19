import { useI18n } from "@/i18n";
import { LANGUAGES, LANGUAGE_LABELS, type Lang } from "@/i18n/translations";
import styles from "./styles.module.scss";

export function LangSwitcher() {
  const { t, lang, setLang } = useI18n();

  return (
    <select
      className={styles.select}
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t("a11y.language")}
    >
      {LANGUAGES.map((l) => (
        <option key={l} value={l}>
          {LANGUAGE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
