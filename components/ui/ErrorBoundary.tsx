'use client';

import { Component, type ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error): void {
    logger.error('ErrorBoundary caught error', { err: error.message });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300"
        >
          <p className="font-medium">Something went wrong rendering this section.</p>
          <p className="mt-1 text-red-400/80">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
