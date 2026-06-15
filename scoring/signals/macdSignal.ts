import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import type { MacdResult } from '@/indicators';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'macd',
  name: 'MACD (12, 26, 9)',
  category: 'technical',
  description:
    'Trend/momentum oscillator. Bullish/bearish crossovers and the MACD line position vs the signal line.',
};

export function macdSignal(
  result: MacdResult | null,
  isStale: boolean,
): SignalResult {
  if (result === null) return unavailableSignal(SPEC, 'not enough candles');

  let value: SignalValue;
  let detail: string;
  if (result.bullishCross) {
    value = 2;
    detail = 'Bullish MACD crossover within the last 3 bars.';
  } else if (result.bearishCross) {
    value = -2;
    detail = 'Bearish MACD crossover within the last 3 bars.';
  } else if (result.macd > 0 && result.macd > result.signal) {
    value = 1;
    detail = 'MACD positive and above its signal line — bullish.';
  } else if (result.macd < 0 && result.macd < result.signal) {
    value = -1;
    detail = 'MACD negative and below its signal line — bearish.';
  } else {
    value = 0;
    detail = 'MACD mixed / near zero — no clear momentum.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `MACD ${result.macd.toFixed(1)} / sig ${result.signal.toFixed(1)}`,
    isStale,
    available: true,
  });
}
