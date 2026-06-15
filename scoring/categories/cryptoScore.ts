import { buildCategoryScore } from '../normalizer';
import { etfFlowSignal } from '../signals/etfFlowSignal';
import { openInterestSignal } from '../signals/openInterestSignal';
import { fundingRateSignal } from '../signals/fundingRateSignal';
import { fearGreedSignal } from '../signals/fearGreedSignal';
import { stablecoinSignal } from '../signals/stablecoinSignal';
import { exchangeReserveSignal } from '../signals/exchangeReserveSignal';
import type { ServiceResult } from '@/types/api';
import type {
  EtfFlowData,
  ExchangeReserveData,
  FearGreedData,
  FundingRateData,
  OpenInterestData,
  PriceSnapshot,
  StablecoinSupplyData,
} from '@/types/market';
import type { CategoryScore } from '@/types/score';

export interface CryptoInputs {
  etf: ServiceResult<EtfFlowData>;
  openInterest: ServiceResult<OpenInterestData>;
  price: ServiceResult<PriceSnapshot>;
  funding: ServiceResult<FundingRateData>;
  fearGreed: ServiceResult<FearGreedData>;
  stablecoin: ServiceResult<StablecoinSupplyData>;
  reserves: ServiceResult<ExchangeReserveData>;
}

export function cryptoScore(inputs: CryptoInputs): CategoryScore {
  const signals = [
    etfFlowSignal(inputs.etf),
    openInterestSignal(inputs.openInterest, inputs.price),
    fundingRateSignal(inputs.funding),
    fearGreedSignal(inputs.fearGreed),
    stablecoinSignal(inputs.stablecoin),
    exchangeReserveSignal(inputs.reserves),
  ];
  return buildCategoryScore('crypto', signals);
}
