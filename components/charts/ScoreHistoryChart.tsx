'use client';

import { memo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { statusForScore } from '@/scoring/normalizer';
import { formatDate } from '@/lib/formatters';
import type { ScoreHistoryPoint } from '@/types/score';

interface ScoreHistoryChartProps {
  history: ScoreHistoryPoint[];
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as ScoreHistoryPoint;
  return (
    <div className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400">{formatDate(point.date)}</div>
      <div className="font-mono text-base font-semibold text-gray-100">
        {point.score}
      </div>
      <div className="text-gray-400">{point.status}</div>
    </div>
  );
}

function ScoreHistoryChartBase({ history }: ScoreHistoryChartProps) {
  if (history.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-sm text-brand-muted">
        History will appear once daily scores are recorded.
      </div>
    );
  }

  const latestColor = statusForScore(
    history[history.length - 1]?.score ?? 50,
  ).color;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={history}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={latestColor} stopOpacity={0.5} />
              <stop offset="100%" stopColor={latestColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            stroke="#4a4a6a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1e1e2e' }}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            stroke="#4a4a6a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <RechartsTooltip content={<ChartTooltip />} />
          {[20, 40, 60, 80].map((y) => (
            <ReferenceLine key={y} y={y} stroke="#1e1e2e" strokeDasharray="2 4" />
          ))}
          <Area
            type="monotone"
            dataKey="score"
            stroke={latestColor}
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const ScoreHistoryChart = memo(ScoreHistoryChartBase);
export default ScoreHistoryChart;
