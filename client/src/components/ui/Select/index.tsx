import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.scss";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  className?: string;
  children: ReactNode;
}

// Native <select> with consistent styling (matches the input/button box height)
// and a custom chevron so it looks the same across browsers/OSes.
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <div className={styles.wrap}>
      <select className={`${styles.select} ${className ?? ""}`} {...rest}>
        {children}
      </select>
      <span className={styles.chevron} aria-hidden>
        ▾
      </span>
    </div>
  );
}
