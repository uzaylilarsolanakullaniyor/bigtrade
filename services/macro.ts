/**
 * Macro market data: DXY, NASDAQ, S&P 500, WTI crude.
 *
 * Reliability order:
 *  1. FRED (if FRED_API_KEY set) — rock-solid from cloud IPs, one free key
 *     covers all series (DTWEXBGS, NASDAQCOM, SP500, DCOILWTICO).
 *  2. Stooq keyless CSV — works without a key, but can be rate-limited/blocked
 *     from datacenter IPs.
 *  3. Neutral baseline (stale) if both fail.
 */
import { fetchText, errorMessage } from '@/lib/utils';
import { fetchFredSeries, hasFredKey } from '@/lib/fred';
import { logger } from '@/lib/logger';
import { ok, stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';

const NEUTRAL: SeriesChange = { latest: 0, prior: 0, changePct: 0 };

/** values: newest-first daily closes. Compare latest vs ~5 trading days ago. */
function changeFrom(values: number[]): SeriesChange {
  const latest = values[0];
  const prior = values[Math.min(5, values.length - 1)];
  const changePct = prior === 0 ? 0 : ((latest - prior) / prior) * 100;
  return { latest, prior, changePct };
}

async function fredChange(seriesId: string): Promise<SeriesChange> {
  const obs = await fetchFredSeries(seriesId, 15); // newest-first
  if (obs.length < 6) throw new Error(`FRED ${seriesId}: insufficient data`);
  return changeFrom(obs.map((o) => o.value));
}

/**
 * Fetch daily closes from Stooq as a newest-first array.
 * CSV shape: `Date,Open,High,Low,Close,Volume` (ascending date).
 */
async function fetchStooqCloses(symbol: string): Promise<number[]> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const text = await fetchText(url, {
    revalidate: 21600,
    headers: {
      // Stooq rejects some datacenter clients without a browser-like UA.
      'User-Agent':
        'Mozilla/5.0 (compatible; BitcoinMarketScore/1.0; +https://vercel.com)',
    },
  });

  const lines = text.trim().split('\n');
  if (lines.length < 7 || !lines[0].toLowerCase().startsWith('date')) {
    throw new Error('Stooq returned no usable data');
  }

  const closes: number[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const close = Number(lines[i].split(',')[4]);
    if (!Number.isNaN(close)) closes.push(close);
  }
  if (closes.length < 6) throw new Error('Stooq: insufficient rows');

  return closes.reverse(); // newest-first
}

async function seriesChange(
  fredId: string,
  stooqSymbol: string,
  label: string,
): Promise<ServiceResult<SeriesChange>> {
  if (hasFredKey()) {
    try {
      return ok(await fredChange(fredId));
    } catch (err) {
      logger.warn(`macro.${label} FRED failed`, { err: errorMessage(err) });
    }
  }
  try {
    return ok(changeFrom(await fetchStooqCloses(stooqSymbol)));
  } catch (err) {
    logger.warn(`macro.${label} fallback`, { err: errorMessage(err) });
    return stale<SeriesChange>(NEUTRAL, errorMessage(err));
  }
}

/** NASDAQ Composite. */
export function getNasdaq(): Promise<ServiceResult<SeriesChange>> {
  return seriesChange('NASDAQCOM', '^ndq', 'getNasdaq');
}

/** S&P 500 index. */
export function getSp500(): Promise<ServiceResult<SeriesChange>> {
  return seriesChange('SP500', '^spx', 'getSp500');
}

/** ICE US Dollar Index (DXY) — FRED broad dollar index / Stooq dx.f. */
export function getDxy(): Promise<ServiceResult<SeriesChange>> {
  return seriesChange('DTWEXBGS', 'dx.f', 'getDxy');
}

/** WTI light crude oil. */
export function getWti(): Promise<ServiceResult<SeriesChange>> {
  return seriesChange('DCOILWTICO', 'cl.f', 'getWti');
}
