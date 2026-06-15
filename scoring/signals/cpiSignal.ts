import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatPercent, formatDate } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { CpiData } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'cpi',
  name: 'CPI Inflation',
  category: 'macro',
  description:
    'Year-over-year CPI trend. Cooling inflation supports looser policy (bullish); re-accelerating inflation is bearish. Holds until the next monthly release.',
};

export function cpiSignal(result: ServiceResult<CpiData>): SignalResult {
  const d = result.data;
  if (!d || result.isStale || d.releaseDate === '' || d.latest === 0) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live CPI data — treated as in-line.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  // Compare current YoY to prior month's YoY as a proxy for "vs expectations".
  const delta = d.yoyPct - d.yoyPriorPct;
  let value: SignalValue;
  let detail: string;
  if (delta < -0.1) {
    value = 2;
    detail = `Inflation cooling (YoY ${d.yoyPct.toFixed(1)}% vs ${d.yoyPriorPct.toFixed(
      1,
    )}% prior) — supportive of rate cuts.`;
  } else if (delta > 0.1) {
    value = -2;
    detail = `Inflation re-accelerating (YoY ${d.yoyPct.toFixed(
      1,
    )}% vs ${d.yoyPriorPct.toFixed(1)}% prior) — hawkish risk.`;
  } else {
    value = 0;
    detail = `Inflation roughly in-line (YoY ${d.yoyPct.toFixed(1)}%).`;
  }

  const next = d.nextReleaseDate ? ` · Next release: ${formatDate(d.nextReleaseDate)}` : '';
  return makeSignal(SPEC, {
    value,
    detail: detail + next,
    rawValue: `YoY ${formatPercent(d.yoyPct, 1)}`,
    isStale: false,
    available: true,
  });
}
