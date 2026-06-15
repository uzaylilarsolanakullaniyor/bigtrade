/** Persistence for the latest score and the 30-day history (via KV wrapper). */
import { kvGet, kvLPush, kvLRange, kvLTrim, kvSet } from './kv';
import { KV_KEYS, HISTORY_LENGTH } from './constants';
import { logger } from './logger';
import type { MarketScore, ScoreHistoryPoint } from '@/types/score';

export async function saveScore(score: MarketScore): Promise<void> {
  await kvSet(KV_KEYS.latest, score);

  const point: ScoreHistoryPoint = {
    date: score.timestamp.slice(0, 10),
    score: score.composite,
    status: score.status,
    ...(score.btcPrice !== null ? { price: score.btcPrice } : {}),
  };
  await kvLPush(KV_KEYS.history, JSON.stringify(point));
  await kvLTrim(KV_KEYS.history, 0, HISTORY_LENGTH - 1);
}

export async function getLatestScore(): Promise<MarketScore | null> {
  return kvGet<MarketScore>(KV_KEYS.latest);
}

export async function getScoreHistory(): Promise<ScoreHistoryPoint[]> {
  const raw = await kvLRange(KV_KEYS.history, 0, HISTORY_LENGTH - 1);
  const points: ScoreHistoryPoint[] = [];
  for (const item of raw) {
    try {
      // KV may deserialize JSON automatically; handle both string and object.
      const parsed =
        typeof item === 'string'
          ? (JSON.parse(item) as ScoreHistoryPoint)
          : (item as ScoreHistoryPoint);
      points.push(parsed);
    } catch (err) {
      logger.warn('failed to parse history point', { err: String(err) });
    }
  }
  // Stored newest-first; return chronological for charting.
  return points.reverse();
}
