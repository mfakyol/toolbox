import type { ReactNode } from "react";
import styles from "./styles.module.scss";

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  row?: boolean;
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

// A labelled form control wrapper. Renders a <label> so clicking the label
// focuses the control inside it.
export function Field({
  label,
  hint,
  row = false,
  inline = false,
  className,
  children,
}: FieldProps) {
  const cls = [
    styles.field,
    row && styles.row,
    inline && styles.inline,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={cls}>
      {label != null && <span className={styles.label}>{label}</span>}
      {children}
      {hint != null && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}
