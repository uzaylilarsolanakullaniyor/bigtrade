'use client';

import useSWR from 'swr';
import { jsonFetcher } from '@/lib/fetcher';
import type { EventsApiResponse } from '@/types/api';

export function useEvents() {
  const { data, error, isLoading } = useSWR<EventsApiResponse>(
    '/api/events',
    jsonFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    },
  );

  return {
    events: data?.events ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
