import type { ReactNode } from "react";
import styles from "./styles.module.scss";

// Two-column grid that collapses to one column on narrow screens.
export function Columns({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[styles.columns, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
