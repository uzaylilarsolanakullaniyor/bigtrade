import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import { pctChange } from '@/lib/utils';
import type { SignalResult } from '@/types/score';

const EMA50_SPEC: SignalSpec = {
  id: 'ema-50',
  name: 'EMA 50',
  category: 'technical',
  description:
    'Price relative to the 50-day exponential moving average — the medium-term trend.',
};

const EMA200_SPEC: SignalSpec = {
  id: 'ema-200',
  name: 'EMA 200',
  category: 'technical',
  description:
    'Price relative to the 200-day exponential moving average — the long-term bull/bear divide.',
};

export function ema50Signal(
  price: number,
  ema50: number | null,
  isStale: boolean,
): SignalResult {
  if (ema50 === null) return unavailableSignal(EMA50_SPEC, 'not enough candles');
  const above = price > ema50;
  return makeSignal(EMA50_SPEC, {
    value: above ? 1 : -1,
    detail: above
      ? 'Price above the 50-day EMA — medium-term uptrend.'
      : 'Price below the 50-day EMA — medium-term downtrend.',
    rawValue: `${formatPercent(pctChange(ema50, price))} vs EMA50`,
    isStale,
    available: true,
  });
}

export function ema200Signal(
  price: number,
  ema200: number | null,
  isStale: boolean,
): SignalResult {
  if (ema200 === null)
    return unavailableSignal(EMA200_SPEC, 'not enough candles');
  const above = price > ema200;
  return makeSignal(EMA200_SPEC, {
    value: above ? 2 : -2,
    detail: above
      ? 'Price above the 200-day EMA — secular bull regime.'
      : 'Price below the 200-day EMA — secular bear regime.',
    rawValue: `${formatPercent(pctChange(ema200, price))} vs EMA200`,
    isStale,
    available: true,
  });
}
