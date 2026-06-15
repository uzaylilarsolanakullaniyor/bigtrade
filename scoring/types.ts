/**
 * Re-export of the canonical scoring types so the scoring engine can import
 * everything from a single local module.
 */
export type {
  SignalValue,
  SignalLabel,
  CategoryKey,
  MarketStatus,
  SignalResult,
  CategoryScore,
  MarketScore,
  ScoreHistoryPoint,
} from '@/types/score';
