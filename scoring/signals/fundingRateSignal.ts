import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { FundingRateData } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'funding-rate',
  name: 'Funding Rate',
  category: 'crypto',
  description:
    'Perpetual funding rate. Normal positive funding is healthy; extreme funding signals crowded positioning.',
};

export function fundingRateSignal(
  result: ServiceResult<FundingRateData>,
): SignalResult {
  if (!result.data) {
    return unavailableSignal(SPEC, 'funding rate feed missing');
  }

  const dailyPct = result.data.rateDaily * 100;

  let value: SignalValue;
  let detail: string;
  if (dailyPct > 0.1) {
    value = -1;
    detail = 'Elevated funding — crowded long positioning, overheated.';
  } else if (dailyPct >= 0) {
    value = 1;
    detail = 'Normal positive funding — healthy bullish bias.';
  } else if (dailyPct >= -0.05) {
    value = 0;
    detail = 'Slightly negative funding — neutral.';
  } else {
    value = -1;
    detail = 'Deeply negative funding — crowded shorts.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatPercent(dailyPct, 3)} daily`,
    isStale: result.isStale,
    available: true,
  });
}
