import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'sp500',
  name: 'S&P 500 (SPY)',
  category: 'macro',
  description:
    'Broad US equity trend (5-day). A positive trend reflects a constructive macro backdrop.',
};

export function sp500Signal(result: ServiceResult<SeriesChange>): SignalResult {
  const d = result.data;
  if (!d || result.isStale) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live S&P 500 data — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const pct = d.changePct;
  const value: SignalValue = pct >= 0 ? 1 : -1;
  return makeSignal(SPEC, {
    value,
    detail:
      pct >= 0
        ? 'S&P 500 in a positive 5-day trend — constructive backdrop.'
        : 'S&P 500 in a negative 5-day trend — cautious backdrop.',
    rawValue: `${formatPercent(pct)} (5d)`,
    isStale: false,
    available: true,
  });
}
