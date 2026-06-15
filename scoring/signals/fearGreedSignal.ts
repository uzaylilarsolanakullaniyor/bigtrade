import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import type { ServiceResult } from '@/types/api';
import type { FearGreedData } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'fear-greed',
  name: 'Fear & Greed Index',
  category: 'crypto',
  description:
    'Contrarian sentiment gauge. Extreme fear is historically a buying opportunity; extreme greed warns of tops.',
};

export function fearGreedSignal(
  result: ServiceResult<FearGreedData>,
): SignalResult {
  if (!result.data) {
    return unavailableSignal(SPEC, 'Fear & Greed feed missing');
  }

  const v = result.data.value;
  let value: SignalValue;
  let detail: string;
  if (v < 25) {
    value = 2;
    detail = 'Extreme Fear — contrarian buying opportunity.';
  } else if (v < 50) {
    value = 1;
    detail = 'Fear — sentiment favors accumulation.';
  } else if (v < 75) {
    value = 0;
    detail = 'Greed — neutral, watch for froth.';
  } else if (v < 90) {
    value = -1;
    detail = 'High Greed — caution warranted.';
  } else {
    value = -2;
    detail = 'Extreme Greed — elevated risk of a local top.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${v} (${result.data.classification})`,
    isStale: result.isStale,
    available: true,
  });
}
