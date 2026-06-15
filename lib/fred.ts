/** Thin FRED (St. Louis Fed) API helper. Requires FRED_API_KEY. */
import { fetchJson } from './utils';

export interface FredObservation {
  date: string;
  value: number;
}

interface RawFredResponse {
  observations: Array<{ date: string; value: string }>;
}

export function hasFredKey(): boolean {
  return Boolean(process.env.FRED_API_KEY);
}

/**
 * Fetch the most recent `limit` numeric observations (newest first) for a
 * FRED series. Throws when no key is configured or the request fails.
 */
export async function fetchFredSeries(
  seriesId: string,
  limit = 10,
): Promise<FredObservation[]> {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error('FRED_API_KEY not configured');

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${key}&file_type=json` +
    `&sort_order=desc&limit=${limit}`;

  const res = await fetchJson<RawFredResponse>(url, { revalidate: 21600 });
  return res.observations
    .filter((o) => o.value !== '.' && o.value !== '')
    .map((o) => ({ date: o.date, value: Number(o.value) }));
}
