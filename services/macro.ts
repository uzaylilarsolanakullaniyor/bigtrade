/**
 * Macro market data: DXY, NASDAQ (QQQ), S&P 500 (SPY), WTI crude.
 *
 * NASDAQ/S&P use Alpha Vantage (ALPHA_VANTAGE_API_KEY). DXY and WTI use FRED
 * (FRED_API_KEY). When a key is missing or a request fails we return a neutral
 * baseline flagged as stale.
 */
import { fetchJson, errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, stale } from '@/lib/serviceResult';
import { fetchFredSeries, hasFredKey } from '@/lib/fred';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';

const NEUTRAL: SeriesChange = { latest: 0, prior: 0, changePct: 0 };

function changeFrom(values: number[]): SeriesChange {
  // values: newest-first array; compare latest vs ~5 trading days ago.
  const latest = values[0];
  const prior = values[Math.min(5, values.length - 1)];
  const changePct = prior === 0 ? 0 : ((latest - prior) / prior) * 100;
  return { latest, prior, changePct };
}

interface AvDailyResponse {
  'Time Series (Daily)'?: Record<string, { '4. close': string }>;
  Note?: string;
  Information?: string;
}

async function fetchAlphaVantageDaily(symbol: string): Promise<number[]> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY not configured');

  const url =
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY` +
    `&symbol=${symbol}&outputsize=compact&apikey=${key}`;
  const res = await fetchJson<AvDailyResponse>(url, { revalidate: 21600 });

  const series = res['Time Series (Daily)'];
  if (!series) {
    throw new Error(res.Note ?? res.Information ?? 'Alpha Vantage rate-limited');
  }

  return Object.keys(series)
    .sort((a, b) => (a < b ? 1 : -1)) // newest first
    .map((date) => Number(series[date]['4. close']));
}

async function alphaVantageChange(
  symbol: string,
  label: string,
): Promise<ServiceResult<SeriesChange>> {
  try {
    const values = await fetchAlphaVantageDaily(symbol);
    if (values.length < 6) throw new Error('insufficient series length');
    return ok(changeFrom(values));
  } catch (err) {
    logger.warn(`macro.${label} fallback`, { err: errorMessage(err) });
    return stale<SeriesChange>(NEUTRAL, errorMessage(err));
  }
}

export function getNasdaq(): Promise<ServiceResult<SeriesChange>> {
  return alphaVantageChange('QQQ', 'getNasdaq');
}

export function getSp500(): Promise<ServiceResult<SeriesChange>> {
  return alphaVantageChange('SPY', 'getSp500');
}

async function fredChange(
  seriesId: string,
  label: string,
): Promise<ServiceResult<SeriesChange>> {
  if (!hasFredKey()) {
    return stale<SeriesChange>(NEUTRAL, 'FRED_API_KEY not configured');
  }
  try {
    const obs = await fetchFredSeries(seriesId, 12);
    if (obs.length < 6) throw new Error('insufficient series length');
    return ok(changeFrom(obs.map((o) => o.value)));
  } catch (err) {
    logger.warn(`macro.${label} fallback`, { err: errorMessage(err) });
    return stale<SeriesChange>(NEUTRAL, errorMessage(err));
  }
}

/** US Dollar Index proxy via FRED broad dollar index (DTWEXBGS). */
export function getDxy(): Promise<ServiceResult<SeriesChange>> {
  return fredChange('DTWEXBGS', 'getDxy');
}

/** WTI crude oil spot via FRED (DCOILWTICO). */
export function getWti(): Promise<ServiceResult<SeriesChange>> {
  return fredChange('DCOILWTICO', 'getWti');
}
