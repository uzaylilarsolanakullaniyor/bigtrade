/**
 * Vercel KV (Redis) wrapper with a graceful in-memory fallback.
 *
 * When KV env vars are present (on Vercel, or set locally) it uses
 * `@vercel/kv`. Otherwise it falls back to a process-local store so the app
 * builds and runs in local dev without any Redis configured.
 */
import { kv as vercelKv } from '@vercel/kv';
import { logger } from './logger';

const hasKv = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
);

const memValues = new Map<string, unknown>();
const memLists = new Map<string, string[]>();

export function isKvConfigured(): boolean {
  return hasKv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!hasKv) return (memValues.get(key) as T | undefined) ?? null;
  try {
    return await vercelKv.get<T>(key);
  } catch (err) {
    logger.error('kv.get failed', { key, err: String(err) });
    return null;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!hasKv) {
    memValues.set(key, value);
    return;
  }
  try {
    await vercelKv.set(key, value);
  } catch (err) {
    logger.error('kv.set failed', { key, err: String(err) });
  }
}

export async function kvLPush(key: string, value: string): Promise<void> {
  if (!hasKv) {
    const list = memLists.get(key) ?? [];
    list.unshift(value);
    memLists.set(key, list);
    return;
  }
  try {
    await vercelKv.lpush(key, value);
  } catch (err) {
    logger.error('kv.lpush failed', { key, err: String(err) });
  }
}

export async function kvLRange(
  key: string,
  start: number,
  stop: number,
): Promise<string[]> {
  if (!hasKv) {
    const list = memLists.get(key) ?? [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  }
  try {
    return await vercelKv.lrange<string>(key, start, stop);
  } catch (err) {
    logger.error('kv.lrange failed', { key, err: String(err) });
    return [];
  }
}

export async function kvLTrim(
  key: string,
  start: number,
  stop: number,
): Promise<void> {
  if (!hasKv) {
    const list = memLists.get(key) ?? [];
    const end = stop === -1 ? list.length : stop + 1;
    memLists.set(key, list.slice(start, end));
    return;
  }
  try {
    await vercelKv.ltrim(key, start, stop);
  } catch (err) {
    logger.error('kv.ltrim failed', { key, err: String(err) });
  }
}

export async function kvIncr(key: string): Promise<number> {
  if (!hasKv) {
    const current = (memValues.get(key) as number | undefined) ?? 0;
    const next = current + 1;
    memValues.set(key, next);
    return next;
  }
  try {
    return await vercelKv.incr(key);
  } catch (err) {
    logger.error('kv.incr failed', { key, err: String(err) });
    return 0;
  }
}

export async function kvExpire(key: string, seconds: number): Promise<void> {
  if (!hasKv) return;
  try {
    await vercelKv.expire(key, seconds);
  } catch (err) {
    logger.error('kv.expire failed', { key, err: String(err) });
  }
}
