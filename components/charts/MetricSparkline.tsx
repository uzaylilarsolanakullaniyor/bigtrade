'use client';

import { memo } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MetricSparklineProps {
  values: number[];
  color?: string;
}

function MetricSparklineBase({ values, color = '#4ade80' }: MetricSparklineProps) {
  if (values.length < 2) return null;
  const data = values.map((v, i) => ({ i, v }));

  return (
    <div className="h-8 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const MetricSparkline = memo(MetricSparklineBase);
export default MetricSparkline;
