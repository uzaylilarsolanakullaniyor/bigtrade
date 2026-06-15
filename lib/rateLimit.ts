/**
 * Fixed-window rate limiter (token-bucket style) backed by KV when available,
 * with an in-memory fallback. Limits each client IP to N requests per window.
 */
import { kvExpire, kvIncr } from './kv';
import { KV_KEYS } from './constants';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 60;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const windowId = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `${KV_KEYS.rateLimitPrefix}${ip}:${windowId}`;

  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, WINDOW_SECONDS);
  }

  const allowed = count <= MAX_REQUESTS;
  return {
    allowed,
    remaining: Math.max(0, MAX_REQUESTS - count),
    retryAfter: allowed ? 0 : WINDOW_SECONDS,
  };
}

/** Extract a best-effort client IP from request headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
