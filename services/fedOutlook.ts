/**
 * Federal Reserve outlook proxy.
 *
 * CME FedWatch probabilities are not exposed via a stable free API, so we use a
 * conservative neutral baseline ("wait-and-see") flagged as stale. Update
 * `BASELINE` after each FOMC meeting, or wire a probability feed here.
 */
import { stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { FedOutlookData } from '@/types/macro';

const BASELINE: FedOutlookData = {
  stance: 'neutral',
  probability: 0,
  summary: 'Neutral / wait-and-see (baseline — no live FedWatch feed configured)',
};

export async function getFedOutlook(): Promise<ServiceResult<FedOutlookData>> {
  return stale<FedOutlookData>(BASELINE, 'No FedWatch feed configured (baseline)');
}
