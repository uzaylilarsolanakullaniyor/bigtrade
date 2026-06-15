import { buildCategoryScore } from '../normalizer';
import { rsi, macd, ema, adx, bollingerBands } from '@/indicators';
import { rsiSignal } from '../signals/rsiSignal';
import { macdSignal } from '../signals/macdSignal';
import { ema50Signal, ema200Signal } from '../signals/emaSignal';
import { adxSignal } from '../signals/adxSignal';
import { bollingerSignal } from '../signals/bollingerSignal';
import type { ServiceResult } from '@/types/api';
import type { Candle } from '@/types/market';
import type { CategoryScore } from '@/types/score';

export interface TechnicalIndicatorSnapshot {
  price: number | null;
  rsi: number | null;
  ema50: number | null;
  ema200: number | null;
  adx: number | null;
}

export interface TechnicalScoreResult {
  category: CategoryScore;
  snapshot: TechnicalIndicatorSnapshot;
}

export function technicalScore(
  klines: ServiceResult<Candle[]>,
): TechnicalScoreResult {
  const candles = klines.data ?? [];
  const isStale = klines.isStale;

  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const price = closes.length ? closes[closes.length - 1] : null;

  const rsiValue = closes.length ? rsi(closes, 14) : null;
  const macdValue = closes.length ? macd(closes) : null;
  const ema50Value = closes.length ? ema(closes, 50) : null;
  const ema200Value = closes.length ? ema(closes, 200) : null;
  const adxValue =
    highs.length && lows.length ? adx(highs, lows, closes, 14) : null;
  const bbValue = closes.length ? bollingerBands(closes, 20, 2) : null;

  const signals = [
    rsiSignal(rsiValue, isStale),
    macdSignal(macdValue, isStale),
    ema50Signal(price ?? 0, price === null ? null : ema50Value, isStale),
    ema200Signal(price ?? 0, price === null ? null : ema200Value, isStale),
    adxSignal(adxValue, isStale),
    bollingerSignal(bbValue, isStale),
  ];

  return {
    category: buildCategoryScore('technical', signals),
    snapshot: {
      price,
      rsi: rsiValue,
      ema50: ema50Value,
      ema200: ema200Value,
      adx: adxValue,
    },
  };
}
