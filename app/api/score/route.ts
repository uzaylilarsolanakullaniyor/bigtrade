import { NextResponse } from 'next/server';
import { computeMarketScore } from '@/scoring/engine';
import { getLatestScore, saveScore } from '@/lib/scoreStore';
import { enforceRateLimit, jsonError } from '@/lib/apiHelpers';
import { errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { ScoreApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const limited = await enforceRateLimit(request);
  if (limited) return limited;

  try {
    // Prefer the daily score persisted by the cron job.
    const cached = await getLatestScore();
    if (cached) {
      const body: ScoreApiResponse = { score: cached, cached: true };
      return NextResponse.json(body);
    }

    // First run (or KV empty): compute live and persist.
    const score = await computeMarketScore();
    await saveScore(score);
    const body: ScoreApiResponse = { score, cached: false };
    return NextResponse.json(body);
  } catch (err) {
    logger.error('GET /api/score failed', { err: errorMessage(err) });
    return jsonError('Failed to compute market score');
  }
}
