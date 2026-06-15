import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'adx',
  name: 'ADX (14)',
  category: 'technical',
  description:
    'Average Directional Index — trend strength regardless of direction. Above 25 indicates a trending market.',
};

export function adxSignal(
  adxValue: number | null,
  isStale: boolean,
): SignalResult {
  if (adxValue === null) return unavailableSignal(SPEC, 'not enough candles');

  const trending = adxValue > 25;
  const value: SignalValue = trending ? 1 : 0;
  return makeSignal(SPEC, {
    value,
    detail: trending
      ? `ADX at ${adxValue.toFixed(0)} — a defined trend is in force.`
      : `ADX at ${adxValue.toFixed(0)} — ranging / no strong trend.`,
    rawValue: `ADX ${adxValue.toFixed(1)}`,
    isStale,
    available: true,
  });
}
