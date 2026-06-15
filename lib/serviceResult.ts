import type { ServiceResult } from '@/types/api';

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null, isStale: false, timestamp: new Date().toISOString() };
}

/** Live data succeeded but is flagged stale (e.g. cached / baseline). */
export function stale<T>(data: T, error: string | null = null): ServiceResult<T> {
  return { data, error, isStale: true, timestamp: new Date().toISOString() };
}

export function fail<T>(error: string, data: T | null = null): ServiceResult<T> {
  return { data, error, isStale: true, timestamp: new Date().toISOString() };
}
