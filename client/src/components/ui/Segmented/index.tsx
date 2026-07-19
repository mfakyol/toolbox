import type { ReactNode } from "react";
import styles from "./styles.module.scss";

interface SegmentedProps<T extends string> {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}

// Compact single-select segmented control (e.g. encode/decode).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className={styles.seg}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={[styles.btn, value === opt.value && styles.active]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
