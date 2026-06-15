'use client';

import { useState } from 'react';
import type { MarketScore } from '@/types/score';

interface ShareButtonProps {
  score: MarketScore;
}

function buildShareText(score: MarketScore): string {
  const drivers = score.topPositiveDrivers.slice(0, 3).join(', ');
  const driverText = drivers ? ` — Top drivers: ${drivers}.` : '';
  return `Bitcoin Market Score: ${score.composite}/100 ${score.emoji} (${score.status})${driverText} #Bitcoin #BTC`;
}

export function ShareButton({ score }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(score);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1 rounded-md border border-brand-border px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
      >
        {copied ? 'Copied!' : 'Copy score'}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md border border-brand-border px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
      >
        Share
      </a>
    </div>
  );
}
