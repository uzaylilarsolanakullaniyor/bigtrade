/** Average Directional Index (Wilder) — pure function. */

/**
 * Compute the latest ADX value from high/low/close arrays using `period`
 * (default 14). Returns null when there is insufficient data.
 */
export function adx(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
): number | null {
  const n = closes.length;
  if (n < period * 2 + 1) return null;
  if (highs.length !== n || lows.length !== n) return null;

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];

  for (let i = 1; i < n; i += 1) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    const highLow = highs[i] - lows[i];
    const highClose = Math.abs(highs[i] - closes[i - 1]);
    const lowClose = Math.abs(lows[i] - closes[i - 1]);
    tr.push(Math.max(highLow, highClose, lowClose));
  }

  // Wilder smoothing of TR, +DM, -DM.
  const smooth = (arr: number[]): number[] => {
    const out: number[] = [];
    let sum = 0;
    for (let i = 0; i < period; i += 1) sum += arr[i];
    out.push(sum);
    for (let i = period; i < arr.length; i += 1) {
      sum = sum - sum / period + arr[i];
      out.push(sum);
    }
    return out;
  };

  const trS = smooth(tr);
  const plusS = smooth(plusDM);
  const minusS = smooth(minusDM);

  const dx: number[] = [];
  for (let i = 0; i < trS.length; i += 1) {
    const plusDI = trS[i] === 0 ? 0 : (plusS[i] / trS[i]) * 100;
    const minusDI = trS[i] === 0 ? 0 : (minusS[i] / trS[i]) * 100;
    const diSum = plusDI + minusDI;
    dx.push(diSum === 0 ? 0 : (Math.abs(plusDI - minusDI) / diSum) * 100);
  }

  if (dx.length < period) return null;

  // ADX = Wilder-smoothed average of DX.
  let adxVal = 0;
  for (let i = 0; i < period; i += 1) adxVal += dx[i];
  adxVal /= period;
  for (let i = period; i < dx.length; i += 1) {
    adxVal = (adxVal * (period - 1) + dx[i]) / period;
  }

  return adxVal;
}
