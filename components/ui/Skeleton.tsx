import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-brand-border/60', className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton matching the MetricCard footprint. */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-6 w-24" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-3/4" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-8">
      <Skeleton className="h-48 w-48 rounded-full" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
    </div>
  );
}
