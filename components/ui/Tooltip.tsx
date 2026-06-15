'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  label?: string;
}

/** Accessible info tooltip triggered by hover and keyboard focus. */
export function Tooltip({ content, label = 'More information' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-brand-border text-[10px] text-brand-muted transition-colors hover:border-gray-500 hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs leading-relaxed text-gray-300 shadow-xl transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
