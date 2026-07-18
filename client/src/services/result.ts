// Discriminated result returned by every service call. Callers branch on
// `success` and handle the error explicitly instead of catching thrown values.
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const fail = (error: string): Result<never> => ({ success: false, error });
