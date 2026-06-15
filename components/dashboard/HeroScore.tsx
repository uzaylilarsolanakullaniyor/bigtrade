'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MarketScore } from '@/types/score';

const ScoreGauge = dynamic(() => import('@/components/charts/ScoreGauge'), {
  ssr: false,
  loading: () => <Skeleton className="mx-auto h-52 w-52 rounded-full" />,
});

interface HeroScoreProps {
  score: MarketScore;
  previousScore: number | null;
}

export function HeroScore({ score, previousScore }: HeroScoreProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, score.composite, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [score.composite]);

  const delta =
    previousScore !== null ? score.composite - previousScore : null;

  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 sm:p-8 animate-fade-in">
      <ScoreGauge score={display} color={score.color} />

      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl">
          {score.emoji}
        </span>
        <span
          className="text-2xl font-semibold"
          style={{ color: score.color }}
        >
          {score.status}
        </span>
      </div>

      {delta !== null && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-brand-muted">vs yesterday:</span>
          <span
            className={
              delta > 0
                ? 'text-green-400'
                : delta < 0
                  ? 'text-red-400'
                  : 'text-gray-400'
            }
          >
            <span aria-hidden="true">
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '■'}
            </span>{' '}
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        </div>
      )}

      <p className="text-center text-xs text-brand-muted">
        Score based on {score.availableSignals}/{score.totalSignals} signals
      </p>
    </section>
  );
}
