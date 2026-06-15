import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'wti-oil',
  name: 'WTI Crude Oil',
  category: 'macro',
  description:
    'WTI crude (5-day change). Falling oil eases inflation pressure (bullish); rising oil adds inflationary risk.',
};

export function oilSignal(result: ServiceResult<SeriesChange>): SignalResult {
  const d = result.data;
  if (!d || result.isStale) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live WTI data — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const pct = d.changePct;
  let value: SignalValue;
  let detail: string;
  if (pct < -2) {
    value = 1;
    detail = 'Oil falling — disinflationary, supportive of risk assets.';
  } else if (pct > 2) {
    value = -1;
    detail = 'Oil rising — inflationary pressure, mild headwind.';
  } else {
    value = 0;
    detail = 'Oil broadly flat — neutral.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatPercent(pct)} (5d)`,
    isStale: false,
    available: true,
  });
}
