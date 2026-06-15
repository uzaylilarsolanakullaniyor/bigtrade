'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroScore } from './HeroScore';
import { SubScoreCards } from './SubScoreCards';
import { TopDrivers } from './TopDrivers';
import { MetricGrid } from './MetricGrid';
import { EventCalendar } from './EventCalendar';
import { ScoreInterpretation } from './ScoreInterpretation';
import { PredictionHistory } from './PredictionHistory';
import { ShareButton } from './ShareButton';
import { ShortcutsModal } from './ShortcutsModal';
import { LastUpdated } from '@/components/ui/LastUpdated';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  HeroSkeleton,
  MetricCardSkeleton,
  Skeleton,
} from '@/components/ui/Skeleton';
import { useMarketScore } from '@/hooks/useMarketScore';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { useEvents } from '@/hooks/useEvents';

const ScoreHistoryChart = dynamic(
  () =>
    import('@/components/charts/ScoreHistoryChart').then(
      (m) => m.ScoreHistoryChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  },
);

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-lg font-semibold text-gray-100">{children}</h2>
  );
}

export function Dashboard() {
  const { score, isLoading, error, refresh } = useMarketScore();
  const { history } = useScoreHistory();
  const { events } = useEvents();

  const [showHistory, setShowHistory] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        void handleRefresh();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHistory((v) => !v);
      } else if (e.key === '?') {
        setShowShortcuts(true);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleRefresh]);

  const previousScore =
    history.length >= 2 ? history[history.length - 2].score : null;

  return (
    <>
      <Header score={score} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && !score && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            Failed to load market score: {error}. Try refreshing.
          </div>
        )}

        {/* Top bar: timestamp + share */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {score ? (
            <LastUpdated
              timestamp={score.timestamp}
              nextUpdate={score.nextUpdate}
              onRefresh={handleRefresh}
              isRefreshing={refreshing}
            />
          ) : (
            <Skeleton className="h-8 w-64" />
          )}
          {score && <ShareButton score={score} />}
        </div>

        {/* Hero + interpretation */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {score ? (
            <ErrorBoundary>
              <HeroScore score={score} previousScore={previousScore} />
            </ErrorBoundary>
          ) : (
            <HeroSkeleton />
          )}

          <div className="flex flex-col gap-4">
            {score ? (
              <ScoreInterpretation interpretation={score.interpretation} />
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
            {score ? (
              <SubScoreCards
                crypto={score.categories.crypto}
                technical={score.categories.technical}
                macro={score.categories.macro}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            )}
          </div>
        </div>

        {/* Drivers */}
        {score && (
          <section className="mb-8">
            <TopDrivers
              signals={score.signals}
              positiveNames={score.topPositiveDrivers}
              negativeNames={score.topNegativeDrivers}
            />
          </section>
        )}

        {/* History */}
        {showHistory && (
          <section className="mb-8">
            <SectionTitle>30-Day Score History</SectionTitle>
            <ErrorBoundary>
              <ScoreHistoryChart history={history} />
            </ErrorBoundary>
          </section>
        )}

        {/* Prediction accuracy tracker (click to expand) */}
        <section className="mb-8">
          <ErrorBoundary>
            <PredictionHistory history={history} />
          </ErrorBoundary>
        </section>

        {/* Metric grid */}
        <section className="mb-8">
          <SectionTitle>All Metrics</SectionTitle>
          {score ? (
            <MetricGrid signals={score.signals} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          )}
        </section>

        {/* Events */}
        <section className="mb-8">
          <SectionTitle>Upcoming Macro Events</SectionTitle>
          <ErrorBoundary>
            <EventCalendar events={events} />
          </ErrorBoundary>
        </section>

        {isLoading && !score && (
          <p className="text-center text-sm text-brand-muted">
            Loading market data…
          </p>
        )}
      </main>
      <Footer />
      <ShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}
