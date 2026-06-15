import { makeSignal, unavailableSignal, type SignalSpec } from '../signalUtils';
import { formatFlow } from '@/lib/formatters';
import type { ServiceResult } from '@/types/api';
import type { EtfFlowData } from '@/types/market';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'etf-flows',
  name: 'Spot BTC ETF Flows',
  category: 'crypto',
  description:
    'Net daily flows into US spot Bitcoin ETFs. Sustained inflows reflect institutional demand.',
};

export function etfFlowSignal(result: ServiceResult<EtfFlowData>): SignalResult {
  const d = result.data;
  if (!d || d.asOf === 'baseline') {
    // No live feed: treat as flat/no-data (neutral) with stale flag.
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No live ETF flow feed — treated as flat.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  const m = d.netFlowUsd;
  let value: SignalValue;
  let detail: string;
  if (m > 500_000_000) {
    value = 2;
    detail = 'Strong net inflows (> $500M) — robust institutional demand.';
  } else if (m > 0) {
    value = 1;
    detail = 'Net inflows — positive demand.';
  } else if (m === 0) {
    value = 0;
    detail = 'Flat flows.';
  } else if (m > -300_000_000) {
    value = -1;
    detail = 'Modest net outflows.';
  } else {
    value = -2;
    detail = 'Heavy net outflows (> $300M) — distribution pressure.';
  }

  return makeSignal(SPEC, {
    value,
    detail,
    rawValue: `${formatFlow(m)} today`,
    isStale: result.isStale,
    available: true,
  });
}

export { SPEC as etfFlowSpec };
export function etfFlowUnavailable(reason: string): SignalResult {
  return unavailableSignal(SPEC, reason);
}
