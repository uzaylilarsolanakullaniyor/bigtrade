/** General-purpose utility helpers. */

/** Concatenate truthy class names. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Clamp a number to a [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Sleep for the given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch JSON with a timeout. Throws on non-2xx or timeout so callers can
 * fall back gracefully.
 */
export async function fetchJson<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number; revalidate?: number } = {},
): Promise<T> {
  const { timeoutMs = 10_000, revalidate, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.headers) Object.assign(headers, init.headers);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers,
      // Next.js data cache hint; ignored outside the framework runtime.
      next: revalidate !== undefined ? { revalidate } : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Safely read an error message from an unknown thrown value. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Percentage change from `from` to `to`. Returns 0 when `from` is 0. */
export function pctChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}
