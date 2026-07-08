import type { ReactNode } from "react";
import styles from "./Chips.module.scss";

interface ChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  render?: (value: T) => ReactNode;
  columns?: number;
}

// A grid of single-select toggle chips (e.g. output format).
export function Chips<T extends string>({
  options,
  value,
  onChange,
  render,
  columns = 3,
}: ChipsProps<T>) {
  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={[styles.chip, value === opt && styles.active]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(opt)}
        >
          {render ? render(opt) : opt}
        </button>
      ))}
    </div>
  );
}
