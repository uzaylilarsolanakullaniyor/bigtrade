/**
 * Macro market data: DXY, NASDAQ, S&P 500, WTI crude.
 *
 * Uses Stooq's keyless daily CSV endpoint (no API key required), so these work
 * out of the box like Binance/CoinGecko. On failure we return a neutral
 * baseline flagged as stale.
 */
import { fetchText, errorMessage } from '@/lib/utils';
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

/**
 * Fetch daily closes from Stooq as a newest-first array.
 * CSV shape: `Date,Open,High,Low,Close,Volume` (ascending date).
 */
async function fetchStooqCloses(symbol: string): Promise<number[]> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const text = await fetchText(url, { revalidate: 21600 });

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

async function stooqChange(
  symbol: string,
  label: string,
): Promise<ServiceResult<SeriesChange>> {
  try {
    const values = await fetchStooqCloses(symbol);
    return ok(changeFrom(values));
  } catch (err) {
    logger.warn(`macro.${label} fallback`, { err: errorMessage(err) });
    return stale<SeriesChange>(NEUTRAL, errorMessage(err));
  }
}

/** NASDAQ Composite. */
export function getNasdaq(): Promise<ServiceResult<SeriesChange>> {
  return stooqChange('^ndq', 'getNasdaq');
}

/** S&P 500 index. */
export function getSp500(): Promise<ServiceResult<SeriesChange>> {
  return stooqChange('^spx', 'getSp500');
}

/** ICE US Dollar Index (DXY) futures. */
export function getDxy(): Promise<ServiceResult<SeriesChange>> {
  return stooqChange('dx.f', 'getDxy');
}

/** WTI light crude oil futures. */
export function getWti(): Promise<ServiceResult<SeriesChange>> {
  return stooqChange('cl.f', 'getWti');
}
