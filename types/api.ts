import type { MarketScore, ScoreHistoryPoint } from './score';
import type { MarketEvent } from './macro';

/**
 * Standard envelope returned by every data service. Lets the scoring engine
 * and UI distinguish live data from stale/fallback data without throwing.
 */
export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
  /** True when the value is cached or a hardcoded neutral baseline. */
  isStale: boolean;
  timestamp: string;
}

export interface ScoreApiResponse {
  score: MarketScore;
  cached: boolean;
}

export interface HistoryApiResponse {
  history: ScoreHistoryPoint[];
}

export interface EventsApiResponse {
  events: MarketEvent[];
}

export interface ApiError {
  error: string;
}
