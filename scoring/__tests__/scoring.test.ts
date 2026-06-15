import { normalizeScore, buildCategoryScore, statusForScore } from '../normalizer';
import { rsiSignal } from '../signals/rsiSignal';
import { fearGreedSignal } from '../signals/fearGreedSignal';
import { ok, fail } from '@/lib/serviceResult';
import type { FearGreedData } from '@/types/market';

describe('normalizeScore', () => {
  it('maps the midpoint to 50', () => {
    expect(normalizeScore(0, -12, 12)).toBe(50);
  });
  it('maps the maximum to 100', () => {
    expect(normalizeScore(12, -12, 12)).toBe(100);
  });
  it('maps the minimum to 0', () => {
    expect(normalizeScore(-12, -12, 12)).toBe(0);
  });
  it('returns 50 for an empty range', () => {
    expect(normalizeScore(0, 0, 0)).toBe(50);
  });
});

describe('statusForScore', () => {
  it('classifies bands correctly', () => {
    expect(statusForScore(10).label).toBe('Extreme Bearish');
    expect(statusForScore(30).label).toBe('Bearish');
    expect(statusForScore(50).label).toBe('Neutral');
    expect(statusForScore(70).label).toBe('Bullish');
    expect(statusForScore(90).label).toBe('Strong Bullish');
    expect(statusForScore(100).label).toBe('Strong Bullish');
  });
});

describe('buildCategoryScore', () => {
  it('excludes unavailable signals from the range', () => {
    const signals = [
      rsiSignal(20, false), // +2, available
      rsiSignal(null, false), // unavailable
    ];
    const cat = buildCategoryScore('technical', signals);
    expect(cat.raw).toBe(2);
    expect(cat.min).toBe(-2);
    expect(cat.max).toBe(2);
    expect(cat.normalized).toBe(100);
  });
});

describe('fearGreedSignal', () => {
  it('is strongly bullish on extreme fear (contrarian)', () => {
    const data: FearGreedData = { value: 10, classification: 'Extreme Fear' };
    const sig = fearGreedSignal(ok(data));
    expect(sig.value).toBe(2);
    expect(sig.available).toBe(true);
  });

  it('is unavailable when data is missing', () => {
    const sig = fearGreedSignal(fail<FearGreedData>('down'));
    expect(sig.available).toBe(false);
  });
});
