/**
 * US CPI (CPI-U, series CUUR0000SA0).
 *
 * Primary source is the BLS public API v1, which is keyless (25 req/day/IP) —
 * so CPI works with no signup. If BLS fails and a FRED_API_KEY is configured,
 * we fall back to FRED (CPIAUCSL); otherwise a neutral baseline (stale).
 */
import { fetchFredSeries, hasFredKey } from '@/lib/fred';
import { fetchJson, errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { CpiData } from '@/types/macro';

const NEUTRAL_BASELINE: CpiData = {
  latest: 0,
  prior: 0,
  momPct: 0,
  yoyPct: 0,
  yoyPriorPct: 0,
  releaseDate: new Date().toISOString().slice(0, 10),
  nextReleaseDate: '',
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** CPI for month M is typically released mid-month M+1. */
function estimateNextRelease(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + 2);
  d.setUTCDate(13);
  return d.toISOString().slice(0, 10);
}

interface BlsObservation {
  year: number;
  month: number;
  value: number;
}

interface BlsResponse {
  status: string;
  message?: string[];
  Results?: {
    series?: Array<{
      data?: Array<{ year: string; period: string; value: string }>;
    }>;
  };
}

function buildCpiData(obs: BlsObservation[]): CpiData {
  // obs newest-first.
  const latest = obs[0].value;
  const prior = obs[1].value;
  const yearAgo = obs[12].value;
  const priorYearAgo = obs.length >= 14 ? obs[13].value : obs[12].value;

  const momPct = prior === 0 ? 0 : ((latest - prior) / prior) * 100;
  const yoyPct = yearAgo === 0 ? 0 : ((latest - yearAgo) / yearAgo) * 100;
  const yoyPriorPct =
    priorYearAgo === 0 ? 0 : ((prior - priorYearAgo) / priorYearAgo) * 100;

  return {
    latest,
    prior,
    momPct,
    yoyPct,
    yoyPriorPct,
    releaseDate: `${obs[0].year}-${pad(obs[0].month)}-01`,
    nextReleaseDate: estimateNextRelease(obs[0].year, obs[0].month),
  };
}

async function fromBls(): Promise<CpiData> {
  const endYear = new Date().getUTCFullYear();
  const startYear = endYear - 1;

  const res = await fetchJson<BlsResponse>(
    'https://api.bls.gov/publicAPI/v1/timeseries/data/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: ['CUUR0000SA0'],
        startyear: String(startYear),
        endyear: String(endYear),
      }),
      revalidate: 21600,
    },
  );

  if (res.status !== 'REQUEST_SUCCEEDED' || !res.Results?.series?.[0]?.data) {
    throw new Error(res.message?.join('; ') || 'BLS request failed');
  }

  const obs: BlsObservation[] = res.Results.series[0].data
    .filter((d) => /^M(0[1-9]|1[0-2])$/.test(d.period))
    .map((d) => ({
      year: Number(d.year),
      month: Number(d.period.slice(1)),
      value: Number(d.value),
    }))
    .filter((d) => !Number.isNaN(d.value))
    .sort((a, b) => b.year - a.year || b.month - a.month);

  if (obs.length < 13) throw new Error('insufficient CPI history from BLS');
  return buildCpiData(obs);
}

async function fromFred(): Promise<CpiData> {
  const series = await fetchFredSeries('CPIAUCSL', 14);
  if (series.length < 14) throw new Error('insufficient CPI history from FRED');
  const obs: BlsObservation[] = series.map((o) => {
    const [y, m] = o.date.split('-');
    return { year: Number(y), month: Number(m), value: o.value };
  });
  return buildCpiData(obs);
}

export async function getCpi(): Promise<ServiceResult<CpiData>> {
  let lastError = 'CPI unavailable';

  // Prefer FRED when a key is configured (reliable from cloud IPs).
  if (hasFredKey()) {
    try {
      return ok(await fromFred());
    } catch (fredErr) {
      lastError = errorMessage(fredErr);
      logger.warn('cpi.getCpi FRED failed', { err: lastError });
    }
  }

  // Keyless BLS public API.
  try {
    return ok(await fromBls());
  } catch (blsErr) {
    lastError = errorMessage(blsErr);
    logger.warn('cpi.getCpi BLS failed', { err: lastError });
  }

  return stale<CpiData>(NEUTRAL_BASELINE, lastError);
}
