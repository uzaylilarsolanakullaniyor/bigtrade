/** Combined stablecoin supply (USDT + USDC) via CoinGecko (free tier). */
import { COINGECKO_BASE_URL } from '@/lib/constants';
import { fetchJson, errorMessage, pctChange } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, fail } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { StablecoinSupplyData } from '@/types/market';

interface RawMarketChart {
  market_caps: Array<[number, number]>;
}

async function fetchMarketCapSeries(id: string): Promise<Array<[number, number]>> {
  const url = `${COINGECKO_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`;
  const res = await fetchJson<RawMarketChart>(url, { revalidate: 21600 });
  if (!res.market_caps?.length) throw new Error(`no market cap data for ${id}`);
  return res.market_caps;
}

export async function getStablecoinSupply(): Promise<
  ServiceResult<StablecoinSupplyData>
> {
  try {
    const [usdt, usdc] = await Promise.all([
      fetchMarketCapSeries('tether'),
      fetchMarketCapSeries('usd-coin'),
    ]);

    const currentUsdt = usdt[usdt.length - 1][1];
    const currentUsdc = usdc[usdc.length - 1][1];
    const weekUsdt = usdt[0][1];
    const weekUsdc = usdc[0][1];

    const current = currentUsdt + currentUsdc;
    const weekAgo = weekUsdt + weekUsdc;

    return ok({
      current,
      weekAgo,
      changePct: pctChange(weekAgo, current),
    });
  } catch (err) {
    logger.error('stablecoin.getStablecoinSupply failed', {
      err: errorMessage(err),
    });
    return fail<StablecoinSupplyData>(errorMessage(err));
  }
}
