'use client';

import { useMemo, useState } from 'react';
import { buildPredictions } from '@/lib/predictions';
import { formatDate, formatPercent, formatUsd } from '@/lib/formatters';
import { statusForScore } from '@/scoring/normalizer';
import { cn } from '@/lib/utils';
import type {
  PredictionDirection,
  PredictionRecord,
  ScoreHistoryPoint,
} from '@/types/score';

interface PredictionHistoryProps {
  history: ScoreHistoryPoint[];
}

function DirectionLabel({ direction }: { direction: PredictionDirection }) {
  if (direction === 'up') {
    return <span className="text-green-400">▲ Up</span>;
  }
  if (direction === 'down') {
    return <span className="text-red-400">▼ Down</span>;
  }
  return <span className="text-gray-400">— Neutral</span>;
}

function ResultBadge({ result }: { result: PredictionRecord['result'] }) {
  const map: Record<PredictionRecord['result'], { text: string; cls: string }> = {
    correct: { text: '✓ Correct', cls: 'bg-green-500/20 text-green-300' },
    wrong: { text: '✗ Wrong', cls: 'bg-red-500/20 text-red-300' },
    'no-call': { text: 'No call', cls: 'bg-gray-500/20 text-gray-400' },
    pending: { text: 'Pending', cls: 'bg-yellow-500/15 text-yellow-300' },
  };
  const { text, cls } = map[result];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cls)}>
      {text}
    </span>
  );
}

export function PredictionHistory({ history }: PredictionHistoryProps) {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => buildPredictions(history), [history]);

  const graded = summary.correct + summary.wrong;

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-200">
          Prediction History
        </span>
        <span className="flex items-center gap-3">
          {summary.accuracy !== null ? (
            <span className="text-xs text-brand-muted">
              Accuracy{' '}
              <span
                className="font-mono font-semibold"
                style={{ color: statusForScore(summary.accuracy).color }}
              >
                {summary.accuracy}%
              </span>{' '}
              ({summary.correct}/{graded})
            </span>
          ) : (
            <span className="text-xs text-brand-muted">No graded calls yet</span>
          )}
          <span aria-hidden="true" className="text-brand-muted">
            {open ? '−' : '+'}
          </span>
        </span>
      </button>

      {open && (
        <div className="border-t border-brand-border px-2 pb-3 pt-2">
          <p className="px-2 pb-3 text-xs leading-relaxed text-brand-muted">
            Each day&apos;s score implies a directional call (≥60 up, ≤40 down,
            otherwise neutral). It is graded against the next recorded
            day&apos;s BTC price; moves under {0.5}% count as no decisive call.
            History builds up daily as the cron records new scores.
          </p>

          {summary.records.length === 0 ? (
            <p className="px-2 py-4 text-sm text-brand-muted">
              No history yet — predictions will appear once daily scores are
              recorded (Vercel KV / Redis required for persistence).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-brand-muted">
                    <th scope="col" className="px-2 py-2 font-medium">Date</th>
                    <th scope="col" className="px-2 py-2 font-medium">Score</th>
                    <th scope="col" className="px-2 py-2 font-medium">Call</th>
                    <th scope="col" className="px-2 py-2 font-medium">BTC @ score</th>
                    <th scope="col" className="px-2 py-2 font-medium">Move</th>
                    <th scope="col" className="px-2 py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.records.map((r) => (
                    <tr
                      key={r.date}
                      className="border-b border-brand-border/50 last:border-0"
                    >
                      <td className="px-2 py-2 text-gray-400">
                        {formatDate(r.date)}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className="font-mono font-semibold tabular-nums"
                          style={{ color: statusForScore(r.score).color }}
                        >
                          {r.score}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <DirectionLabel direction={r.direction} />
                      </td>
                      <td className="px-2 py-2 font-mono tabular-nums text-gray-300">
                        {r.priceAtScore !== null ? formatUsd(r.priceAtScore) : '—'}
                      </td>
                      <td className="px-2 py-2 font-mono tabular-nums">
                        {r.actualChangePct !== null ? (
                          <span
                            className={
                              r.actualChangePct >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {formatPercent(r.actualChangePct)}
                          </span>
                        ) : (
                          <span className="text-brand-muted">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <ResultBadge result={r.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
