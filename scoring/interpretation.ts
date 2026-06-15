import type { MarketScore, SignalResult } from '@/types/score';

function findSignal(
  score: MarketScore,
  id: string,
): SignalResult | undefined {
  return score.signals.find((s) => s.id === id);
}

/**
 * Auto-generate a plain-English interpretation of the composite score based on
 * the actual signal data (no placeholder text).
 */
export function buildInterpretation(score: MarketScore): string {
  const parts: string[] = [];

  parts.push(
    `A score of ${score.composite} means Bitcoin's market conditions are ${score.status}.`,
  );

  const supportive: string[] = [];

  const ema200 = findSignal(score, 'ema-200');
  if (ema200?.available) {
    supportive.push(
      ema200.value > 0
        ? 'price trading above the 200-day EMA'
        : 'price trading below the 200-day EMA',
    );
  }

  const fng = findSignal(score, 'fear-greed');
  if (fng?.available && fng.rawValue) {
    supportive.push(`a Fear & Greed reading of ${fng.rawValue}`);
  }

  const etf = findSignal(score, 'etf-flows');
  if (etf?.available && etf.value !== 0 && etf.rawValue) {
    supportive.push(`ETF flows of ${etf.rawValue}`);
  }

  if (supportive.length) {
    parts.push(`This reflects ${supportive.join(', ')}.`);
  }

  if (score.topPositiveDrivers.length) {
    parts.push(
      `The strongest bullish drivers are ${score.topPositiveDrivers.join(', ')}.`,
    );
  }
  if (score.topNegativeDrivers.length) {
    parts.push(
      `The main bearish drivers are ${score.topNegativeDrivers.join(', ')}.`,
    );
  }

  if (score.availableSignals < score.totalSignals) {
    parts.push(
      `Score based on ${score.availableSignals}/${score.totalSignals} available signals.`,
    );
  }

  return parts.join(' ');
}
