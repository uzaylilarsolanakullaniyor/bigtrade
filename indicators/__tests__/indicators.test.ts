import { ema, emaSeries } from '../ema';
import { rsi } from '../rsi';
import { macd } from '../macd';
import { adx } from '../adx';
import { bollingerBands } from '../bollingerBands';

describe('ema', () => {
  it('returns the constant for a flat series', () => {
    const values = Array.from({ length: 60 }, () => 100);
    expect(ema(values, 50)).toBeCloseTo(100, 6);
  });

  it('produces a series of the expected length', () => {
    const values = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(emaSeries(values, 10)).toHaveLength(21);
  });

  it('returns empty when not enough data', () => {
    expect(emaSeries([1, 2, 3], 10)).toEqual([]);
  });
});

describe('rsi', () => {
  it('is 100 for a strictly rising series (no losses)', () => {
    const closes = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(rsi(closes, 14)).toBe(100);
  });

  it('returns null when not enough data', () => {
    expect(rsi([1, 2, 3], 14)).toBeNull();
  });
});

describe('macd', () => {
  it('is flat (zero) for a constant series', () => {
    const closes = Array.from({ length: 60 }, () => 100);
    const result = macd(closes);
    expect(result).not.toBeNull();
    expect(result?.macd).toBeCloseTo(0, 6);
    expect(result?.signal).toBeCloseTo(0, 6);
    expect(result?.bullishCross).toBe(false);
    expect(result?.bearishCross).toBe(false);
  });

  it('returns null when not enough data', () => {
    expect(macd(Array.from({ length: 10 }, () => 1))).toBeNull();
  });
});

describe('adx', () => {
  it('returns 0 for a perfectly flat market', () => {
    const flat = Array.from({ length: 40 }, () => 100);
    expect(adx(flat, flat, flat, 14)).toBe(0);
  });

  it('returns null when not enough data', () => {
    const short = Array.from({ length: 5 }, () => 1);
    expect(adx(short, short, short, 14)).toBeNull();
  });
});

describe('bollingerBands', () => {
  it('collapses to the price when volatility is zero', () => {
    const closes = Array.from({ length: 20 }, () => 100);
    const bb = bollingerBands(closes, 20, 2);
    expect(bb).not.toBeNull();
    expect(bb?.upper).toBeCloseTo(100, 6);
    expect(bb?.lower).toBeCloseTo(100, 6);
    expect(bb?.percentB).toBeCloseTo(0.5, 6);
  });
});
