import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/events';
import { enforceRateLimit, jsonError } from '@/lib/apiHelpers';
import { errorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { EventsApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const limited = await enforceRateLimit(request);
  if (limited) return limited;

  try {
    const events = getUpcomingEvents(new Date(), 8);
    const body: EventsApiResponse = { events };
    return NextResponse.json(body);
  } catch (err) {
    logger.error('GET /api/events failed', { err: errorMessage(err) });
    return jsonError('Failed to load market events');
  }
}
