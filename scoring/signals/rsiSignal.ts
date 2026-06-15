import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'rsi',
  name: 'RSI (14)',
  category: 'technical',
  description:
    'Relative Strength Index on daily candles. Below 30 is oversold (bullish), above 70 is overbought (bearish).',
};

export function rsiSignal(
  rsiValue: number | null,
  isStale: boolean,
): SignalResult {
  if (rsiValue === null) return unavailableSignal(SPEC, 'not enough candles');

  let value: SignalValue;
  let detail: string;
  if (rsiValue < 30) {
    value = 2;
    detail = `RSI at ${rsiValue.toFixed(0)} — oversold, mean-reversion upside.`;
  } else if (rsiValue < 50) {
    value = 1;
    detail = `RSI at ${rsiValue.toFixed(0)} — below midline, room to run.`;
  } else if (rsiValue <= 70) {
    value = 0;
    detail = `RSI at ${rsiValue.toFixed(0)} — neutral momentum.`;
  } else if (rsiValue <= 80) {
    value = -1;
    detail = `RSI at ${rsiValue.toFixed(0)} — overbought, caution.`;
  } else {
    value = -2;
    detail = `RSI at ${rsiValue.toFixed(0)} — extremely overbought.`;
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `RSI ${rsiValue.toFixed(1)}`,
    isStale,
    available: true,
  });
}
