import type { CategoryKey, MarketStatus, SignalLabel, SignalValue } from '@/types/score';

/** Category weights — must sum to 1. */
export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  crypto: 0.5,
  technical: 0.2,
  macro: 0.3,
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  crypto: 'Crypto Market Data',
  technical: 'Technical Analysis',
  macro: 'Macroeconomic Data',
};

export interface MarketStateDef {
  min: number;
  max: number;
  label: MarketStatus;
  color: string;
  emoji: string;
}

/** Composite score thresholds. Upper bound is exclusive except for the top band. */
export const MARKET_STATES: MarketStateDef[] = [
  { min: 0, max: 20, label: 'Extreme Bearish', color: '#ef4444', emoji: '🔴' },
  { min: 20, max: 40, label: 'Bearish', color: '#f97316', emoji: '🟠' },
  { min: 40, max: 60, label: 'Neutral', color: '#eab308', emoji: '🟡' },
  { min: 60, max: 80, label: 'Bullish', color: '#22c55e', emoji: '🟢' },
  { min: 80, max: 100.01, label: 'Strong Bullish', color: '#4ade80', emoji: '🚀' },
];

/** Map a -2..+2 signal value to its label. */
export function signalLabel(value: SignalValue): SignalLabel {
  switch (value) {
    case 2:
      return 'Strong Bullish';
    case 1:
      return 'Bullish';
    case 0:
      return 'Neutral';
    case -1:
      return 'Bearish';
    default:
      return 'Strong Bearish';
  }
}

/** Tailwind class fragments per signal value, used by SignalBadge. */
export function signalBadgeClass(value: SignalValue): string {
  switch (value) {
    case 2:
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 1:
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 0:
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case -1:
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    default:
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
  }
}

/** Total number of signals tracked by the engine. */
export const TOTAL_SIGNALS = 18;

/** KV keys. */
export const KV_KEYS = {
  latest: 'score:latest',
  history: 'score:history',
  cachePrefix: 'score:cache:',
  rateLimitPrefix: 'ratelimit:',
} as const;

export const HISTORY_LENGTH = 30;

/**
 * Binance endpoints.
 *
 * Spot REST defaults to `data-api.binance.vision` — Binance's public market
 * data mirror, which (unlike `api.binance.com`) is NOT geo-blocked from US
 * cloud IPs like Vercel's. Override with NEXT_PUBLIC_BINANCE_BASE_URL if you
 * proxy through your own region.
 */
export const BINANCE_BASE_URL =
  process.env.NEXT_PUBLIC_BINANCE_BASE_URL ?? 'https://data-api.binance.vision';
export const BINANCE_FUTURES_BASE_URL =
  process.env.NEXT_PUBLIC_BINANCE_FUTURES_BASE_URL ?? 'https://fapi.binance.com';
export const FEAR_GREED_URL =
  process.env.NEXT_PUBLIC_FEAR_GREED_URL ?? 'https://api.alternative.me/fng/';
export const COINGECKO_BASE_URL =
  process.env.COINGECKO_BASE_URL ?? 'https://api.coingecko.com/api/v3';

export const SYMBOL = 'BTCUSDT';
