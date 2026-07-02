// Line-based diff (LCS-based). Produces aligned rows for a
// side-by-side left/right comparison.

export type RowType = "equal" | "del" | "ins" | "mod";

export interface DiffRow {
  type: RowType;
  left: string | null; // left (original) line
  right: string | null; // right (changed) line
  leftNo: number | null;
  rightNo: number | null;
}

export interface DiffResult {
  rows: DiffRow[];
  added: number;
  removed: number;
}

type Op = { type: "equal" | "del" | "ins"; text: string };

// Builds an op list (equal/del/ins) from the LCS of two line arrays.
function diffOps(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  // dp[i][j] = LCS length for a[i..], b[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: a[i] });
      i++;
    } else {
      ops.push({ type: "ins", text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", text: a[i++] });
  while (j < m) ops.push({ type: "ins", text: b[j++] });
  return ops;
}

export function diffLines(leftText: string, rightText: string): DiffResult {
  const a = leftText.split("\n");
  const b = rightText.split("\n");
  const ops = diffOps(a, b);

  const rows: DiffRow[] = [];
  let leftNo = 1;
  let rightNo = 1;
  let added = 0;
  let removed = 0;

  // Pair consecutive del/ins groups into 'mod' rows (side-by-side change).
  let dels: string[] = [];
  let inss: string[] = [];

  const flush = () => {
    const pairs = Math.min(dels.length, inss.length);
    for (let k = 0; k < pairs; k++) {
      rows.push({
        type: "mod",
        left: dels[k],
        right: inss[k],
        leftNo: leftNo++,
        rightNo: rightNo++,
      });
      removed++;
      added++;
    }
    for (let k = pairs; k < dels.length; k++) {
      rows.push({
        type: "del",
        left: dels[k],
        right: null,
        leftNo: leftNo++,
        rightNo: null,
      });
      removed++;
    }
    for (let k = pairs; k < inss.length; k++) {
      rows.push({
        type: "ins",
        left: null,
        right: inss[k],
        leftNo: null,
        rightNo: rightNo++,
      });
      added++;
    }
    dels = [];
    inss = [];
  };

  for (const op of ops) {
    if (op.type === "del") dels.push(op.text);
    else if (op.type === "ins") inss.push(op.text);
    else {
      flush();
      rows.push({
        type: "equal",
        left: op.text,
        right: op.text,
        leftNo: leftNo++,
        rightNo: rightNo++,
      });
    }
  }
  flush();

  return { rows, added, removed };
}
