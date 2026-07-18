import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGUAGES, translations, type Lang } from "./translations";

const STORAGE_KEY = "lang";

// Default language: localStorage → else browser language → else English.
function detectDefaultLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (LANGUAGES as readonly string[]).includes(saved)) {
      return saved as Lang;
    }
  } catch {
    // silently ignore if localStorage is unavailable
  }
  const nav =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  if (nav.startsWith("tr")) return "tr";
  if (nav.startsWith("de")) return "de";
  return "en";
}

type TFunc = (key: string, params?: Record<string, string | number>) => string;

// Translate a server error: prefer the code's `error.*` translation, fall back
// to the server-provided message, then a generic error.
type TErrFunc = (code?: string, fallback?: string) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunc;
  te: TErrFunc;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) =>
    k in params ? String(params[k]) : `{${k}}`
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback<TFunc>(
    (key, params) => {
      const dict = translations[lang];
      return interpolate(dict[key] ?? key, params);
    },
    [lang]
  );

  const te = useCallback<TErrFunc>(
    (code, fallback) => {
      const dict = translations[lang];
      if (code && dict[`error.${code}`]) return dict[`error.${code}`];
      return fallback || dict["error.INTERNAL"];
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, te }),
    [lang, setLang, t, te]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Translation hook: const { t, lang, setLang } = useI18n();
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider.");
  return ctx;
}
