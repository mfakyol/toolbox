import type { ReactNode } from "react";
import styles from "./styles.module.scss";

// Centered muted subtitle under a page title.
export function PageIntro({ children }: { children: ReactNode }) {
  return <p className={styles.intro}>{children}</p>;
}

export type AlertTone = "error" | "success" | "warn";

// Inline status message box.
export function Alert({
  tone = "error",
  className,
  children,
}: {
  tone?: AlertTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[styles.alert, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
