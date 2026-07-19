import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.scss";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  className?: string;
  children: ReactNode;
}

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
