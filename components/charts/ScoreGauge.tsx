'use client';

import { memo } from 'react';
import {
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

interface ScoreGaugeProps {
  score: number;
  color: string;
}

function ScoreGaugeBase({ score, color }: ScoreGaugeProps) {
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <div
      className="relative mx-auto h-52 w-52"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Bitcoin Market Score: ${score} out of 100`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#1e1e2e' }}
            dataKey="value"
            cornerRadius={8}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-5xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs text-brand-muted">/ 100</span>
      </div>
    </div>
  );
}

export const ScoreGauge = memo(ScoreGaugeBase);
export default ScoreGauge;
