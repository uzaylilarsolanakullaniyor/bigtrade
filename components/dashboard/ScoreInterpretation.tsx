'use client';

import { useState } from 'react';

interface ScoreInterpretationProps {
  interpretation: string;
}

export function ScoreInterpretation({ interpretation }: ScoreInterpretationProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-200"
      >
        <span>Score Interpretation</span>
        <span aria-hidden="true" className="text-brand-muted">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm leading-relaxed text-gray-300">
          {interpretation}
        </p>
      )}
    </div>
  );
}
