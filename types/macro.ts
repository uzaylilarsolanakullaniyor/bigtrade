/** Macroeconomic data types. */

/** A 5-day rate-of-change series result used by index/equity signals. */
export interface SeriesChange {
  latest: number;
  /** Value 5 trading days ago. */
  prior: number;
  /** Percentage change over the window. */
  changePct: number;
}

export interface CpiData {
  /** Latest CPI index value. */
  latest: number;
  /** Prior month CPI index value. */
  prior: number;
  /** Month-over-month percentage change. */
  momPct: number;
  /** Year-over-year percentage change. */
  yoyPct: number;
  /** Prior month's year-over-year percentage change (for trend comparison). */
  yoyPriorPct: number;
  /** Date of the latest release (ISO). */
  releaseDate: string;
  /** Estimated next release date (ISO). */
  nextReleaseDate: string;
}

export type FedStance =
  | 'rate-cut-likely'
  | 'pause-dovish'
  | 'neutral'
  | 'pause-hawkish'
  | 'rate-hike-likely';

export interface FedOutlookData {
  stance: FedStance;
  /** Probability (0-100) of the dominant scenario, if known. */
  probability: number;
  summary: string;
}

export type MarketEventType =
  | 'CPI'
  | 'FOMC'
  | 'Rate Decision'
  | 'PPI'
  | 'NFP'
  | 'PCE'
  | 'GDP';

export interface MarketEvent {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  type: MarketEventType;
  description: string;
  /** Computed at request time. */
  daysUntil?: number;
}
