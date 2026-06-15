import { memo } from 'react';
import { SignalBadge } from './SignalBadge';
import { Tooltip } from './Tooltip';
import { cn } from '@/lib/utils';
import type { SignalResult } from '@/types/score';

interface MetricCardProps {
  signal: SignalResult;
}

function MetricCardBase({ signal }: MetricCardProps) {
  const unavailable = !signal.available;

  return (
    <div
      tabIndex={0}
      className={cn(
        'group flex flex-col rounded-xl border border-brand-border bg-brand-surface p-4 transition-colors hover:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
        unavailable && 'opacity-60',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-300">{signal.name}</h3>
          <Tooltip content={signal.description} label={`About ${signal.name}`} />
        </div>
        {unavailable ? (
          <span className="rounded-full bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            Unavailable
          </span>
        ) : (
          <SignalBadge value={signal.value} label={signal.label} />
        )}
      </div>

      <div className="mb-1 font-mono text-lg tabular-nums text-gray-100">
        {signal.rawValue ?? '—'}
      </div>

      <p className="text-xs leading-relaxed text-brand-muted">{signal.detail}</p>

      {signal.isStale && !unavailable && (
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[11px] font-medium text-yellow-400">
          ⚠ Stale data
        </span>
      )}
    </div>
  );
}

export const MetricCard = memo(MetricCardBase);
