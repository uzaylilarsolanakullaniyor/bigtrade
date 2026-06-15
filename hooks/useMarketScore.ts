'use client';

import useSWR from 'swr';
import { jsonFetcher } from '@/lib/fetcher';
import type { ScoreApiResponse } from '@/types/api';

export function useMarketScore() {
  const { data, error, isLoading, mutate } = useSWR<ScoreApiResponse>(
    '/api/score',
    jsonFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    },
  );

  return {
    score: data?.score ?? null,
    cached: data?.cached ?? false,
    isLoading,
    error: error ? (error as Error).message : null,
    refresh: () => mutate(),
  };
}
