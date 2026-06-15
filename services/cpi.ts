/** US CPI (CPIAUCSL) via FRED. Monthly. */
import { fetchFredSeries, hasFredKey } from '@/lib/fred';
import { errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { CpiData } from '@/types/macro';

/** Neutral baseline used when FRED is unavailable. */
const NEUTRAL_BASELINE: CpiData = {
  latest: 0,
  prior: 0,
  momPct: 0,
  yoyPct: 0,
  yoyPriorPct: 0,
  releaseDate: new Date().toISOString().slice(0, 10),
  nextReleaseDate: '',
};

/** CPI for month M is typically released mid-month M+1. */
function estimateNextRelease(latestObsDate: string): string {
  const d = new Date(`${latestObsDate}T00:00:00Z`);
  // Observation is dated the 1st of the reference month; release ~6 weeks later.
  d.setUTCMonth(d.getUTCMonth() + 2);
  d.setUTCDate(13);
  return d.toISOString().slice(0, 10);
}

export async function getCpi(): Promise<ServiceResult<CpiData>> {
  if (!hasFredKey()) {
    return stale<CpiData>(NEUTRAL_BASELINE, 'FRED_API_KEY not configured');
  }
  try {
    // Need 14 months to compute current and prior YoY changes.
    const obs = await fetchFredSeries('CPIAUCSL', 14);
    if (obs.length < 14) throw new Error('insufficient CPI history');

    const latest = obs[0].value;
    const prior = obs[1].value;
    const yearAgo = obs[12].value;
    const priorYearAgo = obs[13].value;

    const momPct = prior === 0 ? 0 : ((latest - prior) / prior) * 100;
    const yoyPct = yearAgo === 0 ? 0 : ((latest - yearAgo) / yearAgo) * 100;
    const yoyPriorPct =
      priorYearAgo === 0 ? 0 : ((prior - priorYearAgo) / priorYearAgo) * 100;

    return ok({
      latest,
      prior,
      momPct,
      yoyPct,
      yoyPriorPct,
      releaseDate: obs[0].date,
      nextReleaseDate: estimateNextRelease(obs[0].date),
    });
  } catch (err) {
    logger.warn('cpi.getCpi fallback', { err: errorMessage(err) });
    return stale<CpiData>(NEUTRAL_BASELINE, errorMessage(err));
  }
}
