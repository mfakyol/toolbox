import type { HTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.scss";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  // "inset" is the lighter sub-panel used inside a Panel (results, boxes).
  variant?: "panel" | "inset";
  className?: string;
  children?: ReactNode;
}

export function Panel({
  variant = "panel",
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      className={[styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
