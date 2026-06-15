/** Alternative.me Crypto Fear & Greed Index (no key required). */
import { FEAR_GREED_URL } from '@/lib/constants';
import { fetchJson, errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ok, fail } from '@/lib/serviceResult';
import type { ServiceResult } from '@/types/api';
import type { FearGreedData } from '@/types/market';

interface RawFng {
  data: Array<{ value: string; value_classification: string }>;
}

export async function getFearGreed(): Promise<ServiceResult<FearGreedData>> {
  const url = `${FEAR_GREED_URL}?limit=1`;
  try {
    const res = await fetchJson<RawFng>(url, { revalidate: 3600 });
    const entry = res.data?.[0];
    if (!entry) throw new Error('empty fear & greed response');
    return ok({
      value: Number(entry.value),
      classification: entry.value_classification,
    });
  } catch (err) {
    logger.error('fearGreed.getFearGreed failed', { err: errorMessage(err) });
    return fail<FearGreedData>(errorMessage(err));
  }
}
