import { memo } from 'react';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { MarketEvent, MarketEventType } from '@/types/macro';

interface EventCalendarProps {
  events: MarketEvent[];
}

const TYPE_COLOR: Record<MarketEventType, string> = {
  CPI: 'bg-orange-500/20 text-orange-300',
  FOMC: 'bg-blue-500/20 text-blue-300',
  'Rate Decision': 'bg-blue-500/20 text-blue-300',
  PPI: 'bg-purple-500/20 text-purple-300',
  NFP: 'bg-green-500/20 text-green-300',
  PCE: 'bg-pink-500/20 text-pink-300',
  GDP: 'bg-teal-500/20 text-teal-300',
};

function EventCalendarBase({ events }: EventCalendarProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-brand-muted">No upcoming events.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-brand-muted">
            <th scope="col" className="px-4 py-3 font-medium">Event</th>
            <th scope="col" className="px-4 py-3 font-medium">Date</th>
            <th scope="col" className="px-4 py-3 font-medium">Days Until</th>
            <th scope="col" className="px-4 py-3 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isToday = event.daysUntil === 0;
            return (
              <tr
                key={event.id}
                className="border-b border-brand-border/50 last:border-0"
              >
                <td className="px-4 py-3 text-gray-200">{event.name}</td>
                <td className="px-4 py-3 text-gray-400">
                  {formatDate(event.date)}
                </td>
                <td className="px-4 py-3">
                  {isToday ? (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300">
                      Today
                    </span>
                  ) : (
                    <span className="font-mono tabular-nums text-gray-300">
                      {event.daysUntil}d
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      TYPE_COLOR[event.type],
                    )}
                  >
                    {event.type}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const EventCalendar = memo(EventCalendarBase);
