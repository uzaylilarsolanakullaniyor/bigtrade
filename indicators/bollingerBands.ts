/** Bollinger Bands — pure function. */

export interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
  /** Position of price within the bands: 0 = lower band, 1 = upper band. */
  percentB: number;
}

/**
 * Compute Bollinger Bands (period 20, 2 std-dev by default) for the latest bar.
 * Returns null when there is insufficient data.
 */
export function bollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2,
): BollingerResult | null {
  if (closes.length < period) return null;

  const window = closes.slice(closes.length - period);
  const mean = window.reduce((a, b) => a + b, 0) / period;
  const variance =
    window.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const price = closes[closes.length - 1];
  const range = upper - lower;
  const percentB = range === 0 ? 0.5 : (price - lower) / range;

  return { upper, middle: mean, lower, percentB };
}
