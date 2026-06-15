/** Moving Average Convergence Divergence — pure function. */
import { emaSeries } from './ema';

export interface MacdResult {
  macd: number;
  signal: number;
  histogram: number;
  /** Recent histogram values (oldest → newest), up to 4 points. */
  recentHistogram: number[];
  /** True when MACD crossed above the signal line within the last 3 bars. */
  bullishCross: boolean;
  /** True when MACD crossed below the signal line within the last 3 bars. */
  bearishCross: boolean;
}

/**
 * Compute MACD(12, 26, 9). Returns null when there is insufficient data.
 */
export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdResult | null {
  if (closes.length < slow + signalPeriod) return null;

  const fastEma = emaSeries(closes, fast);
  const slowEma = emaSeries(closes, slow);

  // Align series: fastEma is longer (starts earlier). Trim to the slow length.
  const offset = fastEma.length - slowEma.length;
  const macdLine: number[] = [];
  for (let i = 0; i < slowEma.length; i += 1) {
    macdLine.push(fastEma[i + offset] - slowEma[i]);
  }

  const signalLine = emaSeries(macdLine, signalPeriod);
  if (!signalLine.length) return null;

  // Align macdLine to signalLine length.
  const macdAligned = macdLine.slice(macdLine.length - signalLine.length);

  const histogram = macdAligned.map((m, i) => m - signalLine[i]);
  const lastIdx = histogram.length - 1;

  // Detect a sign change in the histogram within the last 3 bars.
  let bullishCross = false;
  let bearishCross = false;
  for (let i = Math.max(1, lastIdx - 2); i <= lastIdx; i += 1) {
    if (histogram[i - 1] <= 0 && histogram[i] > 0) bullishCross = true;
    if (histogram[i - 1] >= 0 && histogram[i] < 0) bearishCross = true;
  }

  return {
    macd: macdAligned[lastIdx],
    signal: signalLine[lastIdx],
    histogram: histogram[lastIdx],
    recentHistogram: histogram.slice(Math.max(0, histogram.length - 4)),
    bullishCross,
    bearishCross,
  };
}
