import { memo } from 'react';
import { signalBadgeClass } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { SignalLabel, SignalValue } from '@/types/score';

interface SignalBadgeProps {
  value: SignalValue;
  label: SignalLabel;
  className?: string;
}

function SignalBadgeBase({ value, label, className }: SignalBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        signalBadgeClass(value),
        className,
      )}
    >
      {/* Text label ensures meaning is never conveyed by color alone. */}
      {label}
    </span>
  );
}

export const SignalBadge = memo(SignalBadgeBase);
