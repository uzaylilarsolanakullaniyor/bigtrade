import { NextResponse } from 'next/server';
import { getScoreHistory } from '@/lib/scoreStore';
import { enforceRateLimit, jsonError } from '@/lib/apiHelpers';
import { errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { HistoryApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const limited = await enforceRateLimit(request);
  if (limited) return limited;

  try {
    const history = await getScoreHistory();
    const body: HistoryApiResponse = { history };
    return NextResponse.json(body);
  } catch (err) {
    logger.error('GET /api/history failed', { err: errorMessage(err) });
    return jsonError('Failed to load score history');
  }
}
