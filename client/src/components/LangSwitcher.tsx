import { useI18n } from "@/i18n";
import { LANGUAGES, LANGUAGE_LABELS, type Lang } from "@/i18n/translations";
import styles from "./LangSwitcher.module.scss";

export function LangSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <select
      className={styles.select}
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l} value={l}>
          {LANGUAGE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
