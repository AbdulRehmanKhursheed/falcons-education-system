'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { reportError } from '@/lib/observability';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { tags: { surface: 'root-error-boundary' }, extra: { digest: error.digest } });
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-lg">
        <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
        <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
        <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
        <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

        <div className="border border-line bg-surface rounded-md px-8 py-16 sm:px-12 sm:py-20 text-center">
          <AlertTriangle className="w-7 h-7 mx-auto text-danger" strokeWidth={1.25} />

          <p className="mt-6 eyebrow text-ink-faint">Error · something went wrong</p>
          <h1
            className="mt-3 font-display text-4xl sm:text-5xl text-ink"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            We hit a snag.
          </h1>
          <p className="mt-4 max-w-md mx-auto text-[14px] text-ink-soft leading-[1.65]">
            An unexpected error interrupted this request. The team has been notified. You can try the action again, or head back to the dashboard.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-sm bg-ink text-paper px-4 py-2 text-[13px] font-medium transition hover:bg-ink-soft"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-sm border border-line text-ink-soft px-4 py-2 text-[13px] font-medium transition hover:bg-surface-3"
            >
              Go to dashboard
            </Link>
          </div>

          {error.digest && (
            <p className="mt-10 text-[11px] tabular text-ink-faint">
              Reference <span className="font-mono">{error.digest}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
