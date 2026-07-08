import styles from "./Progress.module.scss";

// Determinate progress bar. `value` is a percentage (0–100).
export function Progress({ value }: { value: number }) {
  return (
    <div className={styles.track}>
      <div
        className={styles.fill}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
