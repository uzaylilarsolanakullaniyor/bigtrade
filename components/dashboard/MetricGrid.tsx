import { memo } from 'react';
import { MetricCard } from '@/components/ui/MetricCard';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { CategoryKey, SignalResult } from '@/types/score';

interface MetricGridProps {
  signals: SignalResult[];
}

const ORDER: CategoryKey[] = ['crypto', 'technical', 'macro'];

function MetricGridBase({ signals }: MetricGridProps) {
  return (
    <div className="space-y-6">
      {ORDER.map((key) => {
        const group = signals.filter((s) => s.category === key);
        if (group.length === 0) return null;
        return (
          <div key={key}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-muted">
              {CATEGORY_LABELS[key]}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((signal) => (
                <MetricCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const MetricGrid = memo(MetricGridBase);
