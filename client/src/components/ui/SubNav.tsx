import type { ReactNode } from "react";
import styles from "./SubNav.module.scss";

interface SubNavProps<T extends string> {
  tabs: readonly { id: T; label: ReactNode }[];
  active: T;
  onChange: (id: T) => void;
}

// Horizontal tab bar for switching between sub-views on a page.
export function SubNav<T extends string>({
  tabs,
  active,
  onChange,
}: SubNavProps<T>) {
  return (
    <div className={styles.subnav}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={[styles.btn, active === tab.id && styles.active]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
