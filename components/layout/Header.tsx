'use client';

import { useEffect, useRef, useState } from 'react';
import { formatUsd, formatPercent } from '@/lib/formatters';
import type { MarketScore } from '@/types/score';

interface TickerState {
  price: number | null;
  changePct: number | null;
}

interface BinanceTickerMessage {
  c: string; // last price
  P: string; // 24h price change percent
}

interface HeaderProps {
  score: MarketScore | null;
}

export function Header({ score }: HeaderProps) {
  const [ticker, setTicker] = useState<TickerState>({
    price: null,
    changePct: null,
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const ws = new WebSocket(
      'wss://stream.binance.com:9443/ws/btcusdt@ticker',
    );
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as BinanceTickerMessage;
        setTicker({
          price: Number(data.c),
          changePct: Number(data.P),
        });
      } catch {
        // Ignore malformed frames.
      }
    };

    ws.onerror = () => {
      // Connection issues fall back to "—" display; no action needed.
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  const up = (ticker.changePct ?? 0) >= 0;

  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            ₿
          </span>
          <h1 className="text-base font-semibold text-gray-100 sm:text-lg">
            Bitcoin Market Score
          </h1>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono tabular-nums text-gray-100">
              {ticker.price !== null ? formatUsd(ticker.price) : '—'}
            </span>
            {ticker.changePct !== null && (
              <span
                className={up ? 'text-green-400' : 'text-red-400'}
              >
                {formatPercent(ticker.changePct)}
              </span>
            )}
          </div>

          {score && (
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                color: score.color,
                backgroundColor: `${score.color}22`,
              }}
            >
              {score.composite}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
