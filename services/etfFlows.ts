/**
 * Spot Bitcoin ETF net flows (latest trading day).
 *
 * There is no stable free API for aggregate spot-BTC-ETF flows; production data
 * comes from sources like Farside / The Block. Without a configured feed we
 * return a neutral baseline flagged as stale, per the fallback strategy.
 * The cron job persists the last good value to KV so the UI can show it.
 */
import { stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { EtfFlowData } from '@/types/market';

const NEUTRAL_BASELINE: EtfFlowData = {
  netFlowUsd: 0,
  asOf: 'baseline',
};

export async function getEtfFlows(): Promise<ServiceResult<EtfFlowData>> {
  return stale<EtfFlowData>(
    NEUTRAL_BASELINE,
    'No ETF-flow data provider configured (neutral baseline)',
  );
}
