import type { ReactNode } from "react";
import styles from "./styles.module.scss";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warn"
  | "danger";

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
