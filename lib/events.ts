/**
 * Market event calendar.
 *
 * FOMC meeting dates are hardcoded (Fed publishes them in advance). Monthly
 * data releases (CPI, PPI, NFP, PCE, GDP) are generated on a rolling window so
 * the calendar stays fresh without manual edits. Adjust FOMC_RATE_DECISIONS
 * each year, or refine the monthly day-of-month heuristics if needed.
 */
import { daysUntil } from './formatters';
import type { MarketEvent, MarketEventType } from '@/types/macro';

/** Scheduled FOMC rate-decision dates (second day of each meeting). */
const FOMC_RATE_DECISIONS: string[] = [
  // 2025
  '2025-01-29',
  '2025-03-19',
  '2025-05-07',
  '2025-06-18',
  '2025-07-30',
  '2025-09-17',
  '2025-10-29',
  '2025-12-10',
  // 2026 (typical eight-meeting cadence; update when Fed confirms)
  '2026-01-28',
  '2026-03-18',
  '2026-04-29',
  '2026-06-17',
  '2026-07-29',
  '2026-09-16',
  '2026-10-28',
  '2026-12-16',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

/** Day-of-month of the first Friday of a month (used for Non-Farm Payrolls). */
function firstFridayDay(year: number, monthIndex: number): number {
  const firstDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  // Friday = 5
  const offset = (5 - firstDow + 7) % 7;
  return 1 + offset;
}

function makeMonthlyEvents(year: number, monthIndex: number): MarketEvent[] {
  const events: MarketEvent[] = [];
  const tag = `${year}-${pad(monthIndex + 1)}`;

  const monthly: Array<{
    type: MarketEventType;
    name: string;
    day: number;
    description: string;
  }> = [
    {
      type: 'NFP',
      name: 'Non-Farm Payrolls',
      day: firstFridayDay(year, monthIndex),
      description: 'US labor market report (BLS), 8:30 AM ET.',
    },
    {
      type: 'CPI',
      name: 'CPI Release',
      day: 12,
      description: 'Consumer Price Index (BLS), 8:30 AM ET.',
    },
    {
      type: 'PPI',
      name: 'PPI Release',
      day: 13,
      description: 'Producer Price Index (BLS), 8:30 AM ET.',
    },
    {
      type: 'PCE',
      name: 'PCE Deflator',
      day: 28,
      description: "Fed's preferred inflation gauge (BEA), 8:30 AM ET.",
    },
  ];

  for (const m of monthly) {
    events.push({
      id: `${m.type}-${tag}`,
      name: m.name,
      date: isoDate(year, monthIndex, m.day),
      type: m.type,
      description: m.description,
    });
  }

  // GDP is quarterly: advance estimate roughly end of Jan/Apr/Jul/Oct.
  if ([0, 3, 6, 9].includes(monthIndex)) {
    events.push({
      id: `GDP-${tag}`,
      name: 'GDP Release',
      date: isoDate(year, monthIndex, 30),
      type: 'GDP',
      description: 'Quarterly GDP estimate (BEA), 8:30 AM ET.',
    });
  }

  return events;
}

function fomcEvents(): MarketEvent[] {
  const events: MarketEvent[] = [];
  for (const date of FOMC_RATE_DECISIONS) {
    events.push({
      id: `FOMC-${date}`,
      name: 'FOMC Meeting',
      date,
      type: 'FOMC',
      description: 'Federal Open Market Committee meeting (two-day).',
    });
    events.push({
      id: `RATE-${date}`,
      name: 'Fed Rate Decision',
      date,
      type: 'Rate Decision',
      description: 'FOMC interest-rate decision, 2:00 PM ET.',
    });
  }
  return events;
}

/** All known events within a rolling 7-month window around `now`. */
export function getAllEvents(now: Date = new Date()): MarketEvent[] {
  const events: MarketEvent[] = [...fomcEvents()];

  const baseYear = now.getUTCFullYear();
  const baseMonth = now.getUTCMonth();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(Date.UTC(baseYear, baseMonth + i, 1));
    events.push(...makeMonthlyEvents(d.getUTCFullYear(), d.getUTCMonth()));
  }

  return events;
}

/** Upcoming events (today or later) sorted by date, with daysUntil computed. */
export function getUpcomingEvents(now: Date = new Date(), limit = 8): MarketEvent[] {
  return getAllEvents(now)
    .map((e) => ({ ...e, daysUntil: daysUntil(e.date, now) }))
    .filter((e) => (e.daysUntil ?? -1) >= 0)
    .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0))
    .slice(0, limit);
}
