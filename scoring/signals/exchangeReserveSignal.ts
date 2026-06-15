import { makeSignal, type SignalSpec } from '../signalUtils';
import { formatNumber } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { ExchangeReserveData } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'exchange-reserves',
  name: 'Exchange BTC Reserves',
  category: 'crypto',
  description:
    'Net 7-day change in BTC held on exchanges. Outflows (coins moving to cold storage) are bullish.',
};

export function exchangeReserveSignal(
  result: ServiceResult<ExchangeReserveData>,
): SignalResult {
  if (!result.data) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No exchange-reserve feed — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const net = result.data.netChangeBtc; // negative = outflow (bullish)
  let value: SignalValue;
  let detail: string;
  if (net < -10_000) {
    value = 2;
    detail = 'Large net outflows — strong accumulation off exchanges.';
  } else if (net < 0) {
    value = 1;
    detail = 'Net outflows — coins leaving exchanges.';
  } else if (net === 0) {
    value = 0;
    detail = 'Flat reserves.';
  } else if (net <= 10_000) {
    value = -1;
    detail = 'Net inflows — potential selling pressure.';
  } else {
    value = -2;
    detail = 'Heavy net inflows — elevated sell-side risk.';
  }

  const stale = result.isStale;
  return makeSignal(SPEC, {
    value: stale ? 0 : value,
    detail: stale ? 'No exchange-reserve feed — treated as flat.' : detail,
    rawValue: stale ? 'No data' : `${formatNumber(net)} BTC (7d)`,
    isStale: stale,
    available: true,
  });
}
