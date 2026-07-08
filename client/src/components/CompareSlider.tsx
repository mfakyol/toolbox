import { useRef, useState, type PointerEvent } from "react";
import styles from "./CompareSlider.module.scss";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

// Overlays the original (before) and optimized (after) image and
// shows a draggable divider to compare them.
export function CompareSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before",
  afterLabel = "After",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  function updateFromClientX(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (dragging) updateFromClientX(e.clientX);
  }

  return (
    <div
      ref={ref}
      className={styles.compare}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(false)}
    >
      {/* after (fully visible) */}
      <img className={styles.img} src={afterUrl} alt={afterLabel} draggable={false} />
      <span className={`${styles.tag} ${styles.right}`}>{afterLabel}</span>

      {/* before (visible up to pos% from the left) */}
      <div
        className={styles.clip}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img className={styles.img} src={beforeUrl} alt={beforeLabel} draggable={false} />
        <span className={`${styles.tag} ${styles.left}`}>{beforeLabel}</span>
      </div>

      {/* divider + handle */}
      <div className={styles.divider} style={{ left: `${pos}%` }}>
        <div className={styles.handle}>⇔</div>
      </div>
    </div>
  );
}
