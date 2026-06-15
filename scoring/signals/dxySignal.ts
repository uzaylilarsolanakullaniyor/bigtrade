import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { SeriesChange } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'dxy',
  name: 'US Dollar Index (DXY)',
  category: 'macro',
  description:
    'Broad US dollar strength (5-day change). A falling dollar is a tailwind for risk assets and Bitcoin.',
};

export function dxySignal(result: ServiceResult<SeriesChange>): SignalResult {
  const d = result.data;
  if (!d || result.isStale) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live DXY data — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const pct = d.changePct;
  let value: SignalValue;
  let detail: string;
  if (pct < -0.5) {
    value = 2;
    detail = 'Dollar weakening — supportive macro tailwind.';
  } else if (pct > 0.5) {
    value = -2;
    detail = 'Dollar strengthening — macro headwind for risk assets.';
  } else {
    value = 0;
    detail = 'Dollar broadly flat — neutral.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatPercent(pct)} (5d)`,
    isStale: false,
    available: true,
  });
}
