/** Main scoring orchestrator: fetch all sources, evaluate signals, compose. */
import {
  getKlines,
  getPriceSnapshot,
  getOpenInterest,
  getFundingRate,
} from '@/services/binance';
import { getFearGreed } from '@/services/fearGreed';
import { getStablecoinSupply } from '@/services/stablecoin';
import { getExchangeReserves } from '@/services/exchangeReserves';
import { getEtfFlows } from '@/services/etfFlows';
import { getNasdaq, getSp500, getDxy, getWti } from '@/services/macro';
import { getCpi } from '@/services/cpi';
import { getFedOutlook } from '@/services/fedOutlook';

import { cryptoScore } from './categories/cryptoScore';
import { technicalScore } from './categories/technicalScore';
import { macroScore } from './categories/macroScore';
import { statusForScore } from './normalizer';
import { buildInterpretation } from './interpretation';

import { TOTAL_SIGNALS } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import type { MarketScore, SignalResult } from '@/types/score';

function nextUpdateIso(from: Date = new Date()): string {
  const next = new Date(from);
  next.setUTCHours(1, 0, 0, 0);
  if (next.getTime() <= from.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.toISOString();
}

function topDrivers(signals: SignalResult[], positive: boolean): string[] {
  return signals
    .filter((s) => s.available && (positive ? s.value > 0 : s.value < 0))
    .sort((a, b) => (positive ? b.value - a.value : a.value - b.value))
    .slice(0, 3)
    .map((s) => s.name);
}

/** Run every data source and produce the composite MarketScore. */
export async function computeMarketScore(): Promise<MarketScore> {
  const [
    klines,
    price,
    openInterest,
    funding,
    fearGreed,
    stablecoin,
    reserves,
    etf,
    nasdaq,
    sp500,
    dxy,
    wti,
    cpi,
    fed,
  ] = await Promise.all([
    getKlines(300),
    getPriceSnapshot(),
    getOpenInterest(),
    getFundingRate(),
    getFearGreed(),
    getStablecoinSupply(),
    getExchangeReserves(),
    getEtfFlows(),
    getNasdaq(),
    getSp500(),
    getDxy(),
    getWti(),
    getCpi(),
    getFedOutlook(),
  ]);

  const crypto = cryptoScore({
    etf,
    openInterest,
    price,
    funding,
    fearGreed,
    stablecoin,
    reserves,
  });

  const technical = technicalScore(klines);
  const macro = macroScore({ dxy, nasdaq, sp500, wti, cpi, fed });

  const composite = Math.round(
    clamp(
      crypto.normalized * crypto.weight +
        technical.category.normalized * technical.category.weight +
        macro.normalized * macro.weight,
      0,
      100,
    ),
  );

  const state = statusForScore(composite);
  const allSignals = [
    ...crypto.signals,
    ...technical.category.signals,
    ...macro.signals,
  ];
  const availableSignals = allSignals.filter((s) => s.available).length;

  const now = new Date();
  const score: MarketScore = {
    composite,
    status: state.label,
    color: state.color,
    emoji: state.emoji,
    categories: {
      crypto,
      technical: technical.category,
      macro,
    },
    signals: allSignals,
    topPositiveDrivers: topDrivers(allSignals, true),
    topNegativeDrivers: topDrivers(allSignals, false),
    availableSignals,
    totalSignals: TOTAL_SIGNALS,
    btcPrice: price.data?.price ?? technical.snapshot.price ?? null,
    interpretation: '',
    timestamp: now.toISOString(),
    nextUpdate: nextUpdateIso(now),
  };

  score.interpretation = buildInterpretation(score);
  return score;
}
