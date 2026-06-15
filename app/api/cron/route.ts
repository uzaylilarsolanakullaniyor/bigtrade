import { NextResponse } from 'next/server';
import { computeMarketScore } from '@/scoring/engine';
import { saveScore } from '@/lib/scoreStore';
import { jsonError } from '@/lib/apiHelpers';
import { errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, allow (e.g. local dev). On Vercel the cron
  // invocation includes the secret as a Bearer token automatically when set.
  if (!secret) return true;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function run(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const score = await computeMarketScore();
    await saveScore(score);
    logger.info('cron: score computed', {
      composite: score.composite,
      available: score.availableSignals,
    });
    return NextResponse.json({ success: true, score: score.composite });
  } catch (err) {
    logger.error('cron failed', { err: errorMessage(err) });
    return jsonError('Cron computation failed');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  return run(request);
}

// Vercel Cron triggers via GET; support both.
export async function GET(request: Request): Promise<NextResponse> {
  return run(request);
}
