/**
 * Core scoring types shared across the scoring engine, services, API routes
 * and UI components.
 */

export type SignalValue = -2 | -1 | 0 | 1 | 2;

export type SignalLabel =
  | 'Strong Bullish'
  | 'Bullish'
  | 'Neutral'
  | 'Bearish'
  | 'Strong Bearish';

export type CategoryKey = 'crypto' | 'technical' | 'macro';

export type MarketStatus =
  | 'Extreme Bearish'
  | 'Bearish'
  | 'Neutral'
  | 'Bullish'
  | 'Strong Bullish';

/** Result of evaluating a single indicator/signal. */
export interface SignalResult {
  id: string;
  name: string;
  category: CategoryKey;
  value: SignalValue;
  label: SignalLabel;
  /** Human-readable explanation, e.g. "RSI at 42 — Oversold territory". */
  detail: string;
  /** Display-ready raw value, e.g. "RSI: 42" or "+$312M". */
  rawValue?: string;
  /** Short tooltip describing what this metric measures. */
  description: string;
  /** True when this signal is using cached/fallback data. */
  isStale: boolean;
  /** False when the underlying data was unavailable; excluded from the score. */
  available: boolean;
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  /** Sum of available signal values. */
  raw: number;
  /** Minimum possible raw value for the available signals. */
  min: number;
  /** Maximum possible raw value for the available signals. */
  max: number;
  /** Normalized 0-100 value. */
  normalized: number;
  /** Category weight (0.5, 0.2 or 0.3). */
  weight: number;
  signals: SignalResult[];
}

export interface MarketScore {
  composite: number;
  status: MarketStatus;
  color: string;
  emoji: string;
  categories: {
    crypto: CategoryScore;
    technical: CategoryScore;
    macro: CategoryScore;
  };
  signals: SignalResult[];
  topPositiveDrivers: string[];
  topNegativeDrivers: string[];
  /** Number of signals that contributed to the score. */
  availableSignals: number;
  /** Total number of signals tracked by the engine. */
  totalSignals: number;
  /** BTC price (USD) captured at score time, for prediction tracking. */
  btcPrice: number | null;
  /** Auto-generated plain-English interpretation of the score. */
  interpretation: string;
  timestamp: string;
  nextUpdate: string;
}

/** A point in the 30-day score history. */
export interface ScoreHistoryPoint {
  date: string;
  score: number;
  status: MarketStatus;
  /** BTC close/price (USD) recorded with this score. Optional for older points. */
  price?: number;
}

export type PredictionDirection = 'up' | 'down' | 'neutral';
export type PredictionResult = 'correct' | 'wrong' | 'no-call' | 'pending';

/** A score-derived directional call evaluated against the next day's price. */
export interface PredictionRecord {
  date: string;
  score: number;
  status: MarketStatus;
  direction: PredictionDirection;
  priceAtScore: number | null;
  nextPrice: number | null;
  actualChangePct: number | null;
  result: PredictionResult;
}

export interface PredictionSummary {
  records: PredictionRecord[];
  correct: number;
  wrong: number;
  /** Hit rate over evaluated directional calls (0-100), or null if none. */
  accuracy: number | null;
}
