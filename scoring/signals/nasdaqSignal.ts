import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'nasdaq',
  name: 'NASDAQ (QQQ)',
  category: 'macro',
  description:
    'Tech-heavy equity proxy (5-day change). Bitcoin tends to correlate with risk-on tech sentiment.',
};

export function nasdaqSignal(result: ServiceResult<SeriesChange>): SignalResult {
  const d = result.data;
  if (!d || result.isStale) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live NASDAQ data — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const pct = d.changePct;
  let value: SignalValue;
  let detail: string;
  if (pct > 1) {
    value = 2;
    detail = 'NASDAQ strongly up — risk-on environment.';
  } else if (pct > 0) {
    value = 1;
    detail = 'NASDAQ up — mildly risk-on.';
  } else if (pct === 0) {
    value = 0;
    detail = 'NASDAQ flat.';
  } else if (pct > -1) {
    value = -1;
    detail = 'NASDAQ down modestly — mild risk-off.';
  } else {
    value = -2;
    detail = 'NASDAQ sharply down — risk-off.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatPercent(pct)} (5d)`,
    isStale: false,
    available: true,
  });
}
