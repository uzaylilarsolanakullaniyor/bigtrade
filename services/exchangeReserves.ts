/**
 * Exchange BTC reserves (7-day net flow).
 *
 * Live on-chain reserve data requires a paid provider (CryptoQuant / CoinGlass).
 * Without a configured key we return a neutral baseline flagged as stale, per
 * the fallback strategy. Wire a provider here when a key is available.
 */
import { stale } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { ExchangeReserveData } from '@/types/market';

const NEUTRAL_BASELINE: ExchangeReserveData = {
  netChangeBtc: 0,
};

export async function getExchangeReserves(): Promise<
  ServiceResult<ExchangeReserveData>
> {
  // No free real-time source available — return neutral baseline.
  return stale<ExchangeReserveData>(
    NEUTRAL_BASELINE,
    'No exchange-reserve data provider configured (neutral baseline)',
  );
}
