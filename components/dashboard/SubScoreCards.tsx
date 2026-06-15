import { memo } from 'react';
import { statusForScore } from '@/scoring/normalizer';
import type { CategoryScore } from '@/types/score';

interface SubScoreCardsProps {
  crypto: CategoryScore;
  technical: CategoryScore;
  macro: CategoryScore;
}

function Card({ category }: { category: CategoryScore }) {
  const color = statusForScore(category.normalized).color;
  const bullish = category.signals.filter((s) => s.available && s.value > 0).length;
  const bearish = category.signals.filter((s) => s.available && s.value < 0).length;

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-gray-300">{category.label}</h3>
        <span className="text-xs text-brand-muted">
          {Math.round(category.weight * 100)}%
        </span>
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <span
          className="font-mono text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {category.normalized}
        </span>
        <span className="text-xs text-brand-muted">/ 100</span>
      </div>

      <div
        className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-border"
        role="progressbar"
        aria-valuenow={category.normalized}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category.label} score`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${category.normalized}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex gap-3 text-xs">
        <span className="text-green-400">▲ {bullish} bullish</span>
        <span className="text-red-400">▼ {bearish} bearish</span>
      </div>
    </div>
  );
}

function SubScoreCardsBase({ crypto, technical, macro }: SubScoreCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card category={crypto} />
      <Card category={technical} />
      <Card category={macro} />
    </div>
  );
}

export const SubScoreCards = memo(SubScoreCardsBase);
