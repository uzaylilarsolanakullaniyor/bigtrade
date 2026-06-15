'use client';

import useSWR from 'swr';
import { jsonFetcher } from '@/lib/fetcher';
import type { HistoryApiResponse } from '@/types/api';

export function useScoreHistory() {
  const { data, error, isLoading } = useSWR<HistoryApiResponse>(
    '/api/history',
    jsonFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    },
  );

  return {
    history: data?.history ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
