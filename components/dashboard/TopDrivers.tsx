import { memo } from 'react';
import type { SignalResult } from '@/types/score';

interface TopDriversProps {
  signals: SignalResult[];
  positiveNames: string[];
  negativeNames: string[];
}

function lookup(signals: SignalResult[], names: string[]): SignalResult[] {
  return names
    .map((n) => signals.find((s) => s.name === n))
    .filter((s): s is SignalResult => Boolean(s));
}

function DriverList({
  title,
  items,
  tone,
}: {
  title: string;
  items: SignalResult[];
  tone: 'positive' | 'negative';
}) {
  const accent = tone === 'positive' ? 'text-green-400' : 'text-red-400';
  const mark = tone === 'positive' ? '▲' : '▼';

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-brand-muted">None</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-start gap-2 text-sm">
              <span aria-hidden="true" className={accent}>
                {mark}
              </span>
              <span>
                <span className="text-gray-200">{s.name}</span>
                {s.rawValue && (
                  <span className="ml-1 font-mono text-xs text-brand-muted">
                    {s.rawValue}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopDriversBase({
  signals,
  positiveNames,
  negativeNames,
}: TopDriversProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DriverList
        title="Top Positive Drivers"
        items={lookup(signals, positiveNames)}
        tone="positive"
      />
      <DriverList
        title="Top Negative Drivers"
        items={lookup(signals, negativeNames)}
        tone="negative"
      />
    </div>
  );
}

export const TopDrivers = memo(TopDriversBase);
