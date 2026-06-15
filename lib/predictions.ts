import { pctChange } from './utils';
import type {
  PredictionDirection,
  PredictionRecord,
  PredictionSummary,
  ScoreHistoryPoint,
} from '@/types/score';

/** Minimum % move required to count as a directional outcome (filters noise). */
const FLAT_THRESHOLD_PCT = 0.5;

/** Derive the directional call implied by a composite score. */
export function predictionFromScore(score: number): PredictionDirection {
  if (score >= 60) return 'up';
  if (score <= 40) return 'down';
  return 'neutral';
}

/**
 * Turn the chronological score history into evaluated prediction records.
 * Each day's score is a directional call; it is graded against the *next*
 * recorded day's price. The most recent day stays "pending" (no next price).
 */
export function buildPredictions(
  history: ScoreHistoryPoint[],
): PredictionSummary {
  // Ensure chronological order (oldest → newest).
  const points = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));

  const records: PredictionRecord[] = [];
  let correct = 0;
  let wrong = 0;

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const next = points[i + 1];
    const direction = predictionFromScore(point.score);

    const priceAtScore = point.price ?? null;
    const nextPrice = next?.price ?? null;

    let actualChangePct: number | null = null;
    let result: PredictionRecord['result'];

    if (!next) {
      // No following day yet — outcome not known.
      result = 'pending';
    } else if (priceAtScore === null || nextPrice === null) {
      // Missing price data for one side — cannot grade.
      result = 'pending';
    } else if (direction === 'neutral') {
      actualChangePct = pctChange(priceAtScore, nextPrice);
      result = 'no-call';
    } else {
      actualChangePct = pctChange(priceAtScore, nextPrice);
      const movedUp = actualChangePct > FLAT_THRESHOLD_PCT;
      const movedDown = actualChangePct < -FLAT_THRESHOLD_PCT;

      if (!movedUp && !movedDown) {
        // Price essentially flat — treat as no decisive outcome.
        result = 'no-call';
      } else {
        const hit =
          (direction === 'up' && movedUp) ||
          (direction === 'down' && movedDown);
        result = hit ? 'correct' : 'wrong';
        if (hit) correct += 1;
        else wrong += 1;
      }
    }

    records.push({
      date: point.date,
      score: point.score,
      status: point.status,
      direction,
      priceAtScore,
      nextPrice,
      actualChangePct,
      result,
    });
  }

  const graded = correct + wrong;
  const accuracy = graded > 0 ? Math.round((correct / graded) * 100) : null;

  // Newest first for display.
  records.reverse();

  return { records, correct, wrong, accuracy };
}
