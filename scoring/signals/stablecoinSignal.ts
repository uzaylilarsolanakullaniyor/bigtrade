import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import { formatPercent } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { StablecoinSupplyData } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'stablecoin-supply',
  name: 'Stablecoin Supply (USDT + USDC)',
  category: 'crypto',
  description:
    'Combined USDT + USDC market cap over 7 days. Growing supply is dry powder waiting to enter the market.',
};

export function stablecoinSignal(
  result: ServiceResult<StablecoinSupplyData>,
): SignalResult {
  if (!result.data) {
    return unavailableSignal(SPEC, 'stablecoin supply feed missing');
  }

  const pct = result.data.changePct;
  let value: SignalValue;
  let detail: string;
  if (pct > 2) {
    value = 2;
    detail = 'Stablecoin supply expanding fast — strong dry powder inflow.';
  } else if (pct > 0) {
    value = 1;
    detail = 'Stablecoin supply growing — incremental buying power.';
  } else if (pct === 0) {
    value = 0;
    detail = 'Stablecoin supply flat.';
  } else if (pct > -2) {
    value = -1;
    detail = 'Stablecoin supply contracting modestly.';
  } else {
    value = -2;
    detail = 'Stablecoin supply shrinking sharply — capital leaving.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatPercent(pct)} (7d)`,
    isStale: result.isStale,
    available: true,
  });
}
