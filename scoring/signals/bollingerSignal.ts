import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import type { BollingerResult } from '@/indicators';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'bollinger',
  name: 'Bollinger Bands (20, 2)',
  category: 'technical',
  description:
    'Price position within the Bollinger Bands. Near/below the lower band is oversold; near/above the upper band is overbought.',
};

export function bollingerSignal(
  result: BollingerResult | null,
  isStale: boolean,
): SignalResult {
  if (result === null) return unavailableSignal(SPEC, 'not enough candles');

  const b = result.percentB; // 0 = lower band, 1 = upper band
  let value: SignalValue;
  let detail: string;
  if (b < 0) {
    value = 2;
    detail = 'Price below the lower band — stretched oversold.';
  } else if (b < 0.45) {
    value = 1;
    detail = 'Price in the lower half of the bands — mild oversold tilt.';
  } else if (b <= 0.55) {
    value = 0;
    detail = 'Price near the middle band — neutral.';
  } else if (b <= 1) {
    value = -1;
    detail = 'Price in the upper half of the bands — mild overbought tilt.';
  } else {
    value = -2;
    detail = 'Price above the upper band — stretched overbought.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `%B ${(b * 100).toFixed(0)}%`,
    isStale,
    available: true,
  });
}
