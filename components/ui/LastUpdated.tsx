'use client';

import { formatDateTime, formatRelative } from '@/lib/formatters';

interface LastUpdatedProps {
  timestamp: string;
  nextUpdate?: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function LastUpdated({
  timestamp,
  nextUpdate,
  onRefresh,
  isRefreshing = false,
}: LastUpdatedProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
      <span>
        As of <span className="text-gray-300">{formatDateTime(timestamp)}</span>
      </span>
      {nextUpdate && (
        <span className="hidden sm:inline">
          · Next update {formatRelative(nextUpdate)}
        </span>
      )}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh data"
        className="inline-flex items-center gap-1 rounded-md border border-brand-border px-2 py-1 text-gray-300 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-50"
      >
        <span aria-hidden="true" className={isRefreshing ? 'animate-spin' : ''}>
          ↻
        </span>
        {isRefreshing ? 'Refreshing' : 'Refresh'}
      </button>
    </div>
  );
}
