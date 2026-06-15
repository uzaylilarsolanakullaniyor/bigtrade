import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import { formatCompact, formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { OpenInterestData, PriceSnapshot } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'open-interest',
  name: 'Open Interest (Price-Adjusted)',
  category: 'crypto',
  description:
    'Futures open interest combined with price direction. Rising price + rising OI confirms a trend.',
};

export function openInterestSignal(
  oi: ServiceResult<OpenInterestData>,
  price: ServiceResult<PriceSnapshot>,
): SignalResult {
  if (!oi.data || !price.data) {
    return unavailableSignal(SPEC, 'open interest or price feed missing');
  }

  const oiUp = oi.data.current >= oi.data.previous;
  const priceUp = price.data.priceChangePercent >= 0;
  const oiChangePct =
    oi.data.previous === 0
      ? 0
      : ((oi.data.current - oi.data.previous) / oi.data.previous) * 100;

  let value: SignalValue;
  let detail: string;
  if (priceUp && oiUp) {
    value = 2;
    detail = 'Price up with rising OI — new money confirming the move.';
  } else if (priceUp && !oiUp) {
    value = 1;
    detail = 'Price up while OI falls — short covering, mildly bullish.';
  } else if (!priceUp && !oiUp) {
    value = -1;
    detail = 'Price down with falling OI — long liquidation, deleveraging.';
  } else {
    value = -2;
    detail = 'Price down while OI rises — fresh shorts pressing, bearish.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `OI ${formatCompact(oi.data.current)} BTC (${formatPercent(
      oiChangePct,
    )}), price ${formatPercent(price.data.priceChangePercent)}`,
    isStale: oi.isStale || price.isStale,
    available: true,
  });
}
