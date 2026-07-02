// Runs at most `limit` tasks at once; the rest are taken from the
// queue as earlier ones finish. All items are processed in order.
export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  const executing = new Set<Promise<void>>();

  for (let i = 0; i < items.length; i++) {
    const p = worker(items[i], i).finally(() => {
      executing.delete(p);
    });
    executing.add(p);

    if (executing.size >= limit) {
      // Pool is full: wait until at least one task finishes.
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}
