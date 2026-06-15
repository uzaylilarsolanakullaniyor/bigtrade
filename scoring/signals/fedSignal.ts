import { makeSignal, type SignalSpec } from '../signalUtils';
import type { ServiceResult } from '@/types/api';
import type { FedOutlookData } from '@/types/macro';
import type { SignalResult, SignalValue } from '@/types/score';

const SPEC: SignalSpec = {
  id: 'fed-outlook',
  name: 'Federal Reserve Outlook',
  category: 'macro',
  description:
    'Expected path of Fed policy. Cut expectations / dovish guidance are bullish; hike risk / hawkish guidance are bearish.',
};

const STANCE_SCORE: Record<FedOutlookData['stance'], SignalValue> = {
  'rate-cut-likely': 2,
  'pause-dovish': 1,
  neutral: 0,
  'pause-hawkish': -1,
  'rate-hike-likely': -2,
};

export function fedSignal(result: ServiceResult<FedOutlookData>): SignalResult {
  const d = result.data;
  if (!d) {
    return makeSignal(SPEC, {
      value: 0,
      detail: 'No Fed outlook data — treated as neutral.',
      rawValue: 'No data',
      isStale: true,
      available: true,
    });
  }

  return makeSignal(SPEC, {
    value: STANCE_SCORE[d.stance],
    detail: d.summary,
    rawValue:
      d.probability > 0
        ? `${d.stance.replace(/-/g, ' ')} (${d.probability}%)`
        : d.stance.replace(/-/g, ' '),
    isStale: result.isStale,
    available: true,
  });
}
