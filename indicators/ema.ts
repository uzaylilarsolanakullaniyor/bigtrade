/** Exponential Moving Average — pure functions. */

/**
 * Compute the full EMA series for `values` with the given period.
 * Seeds with the simple moving average of the first `period` values.
 */
export function emaSeries(values: number[], period: number): number[] {
  if (period <= 0) throw new Error('period must be > 0');
  if (values.length < period) return [];

  const k = 2 / (period + 1);
  const result: number[] = [];

  // Seed with SMA of the first `period` values.
  let sma = 0;
  for (let i = 0; i < period; i += 1) sma += values[i];
  sma /= period;
  let prev = sma;
  result.push(prev);

  for (let i = period; i < values.length; i += 1) {
    prev = values[i] * k + prev * (1 - k);
    result.push(prev);
  }

  return result;
}

/** Latest EMA value, or null if not enough data. */
export function ema(values: number[], period: number): number | null {
  const series = emaSeries(values, period);
  return series.length ? series[series.length - 1] : null;
}
