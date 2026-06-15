import { clamp } from '@/lib/utils';
import {
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  MARKET_STATES,
  type MarketStateDef,
} from '@/lib/constants';
import type { CategoryKey, CategoryScore, SignalResult } from '@/types/score';

/**
 * Normalize a raw score in [min, max] to a 0-100 scale.
 * Returns 50 (neutral) when the range is empty.
 */
export function normalizeScore(rawScore: number, min: number, max: number): number {
  if (max === min) return 50;
  const pct = ((rawScore - min) / (max - min)) * 100;
  return Math.round(clamp(pct, 0, 100));
}

/** Build a CategoryScore from its evaluated signals. */
export function buildCategoryScore(
  key: CategoryKey,
  signals: SignalResult[],
): CategoryScore {
  const available = signals.filter((s) => s.available);
  const count = available.length;
  const raw = available.reduce((sum, s) => sum + s.value, 0);
  const min = -2 * count;
  const max = 2 * count;

  return {
    key,
    label: CATEGORY_LABELS[key],
    raw,
    min,
    max,
    normalized: normalizeScore(raw, min, max),
    weight: CATEGORY_WEIGHTS[key],
    signals,
  };
}

/** Resolve the market state band for a 0-100 composite score. */
export function statusForScore(composite: number): MarketStateDef {
  const found = MARKET_STATES.find(
    (s) => composite >= s.min && composite < s.max,
  );
  return found ?? MARKET_STATES[MARKET_STATES.length - 1];
}
