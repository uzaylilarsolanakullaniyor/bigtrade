import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from './rateLimit';

/**
 * Apply per-IP rate limiting. Returns a 429 response when the limit is
 * exceeded, otherwise null (caller proceeds).
 */
export async function enforceRateLimit(
  request: Request,
): Promise<NextResponse | null> {
  const ip = clientIp(request.headers);
  const result = await rateLimit(ip);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfter) },
      },
    );
  }
  return null;
}

export function jsonError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
