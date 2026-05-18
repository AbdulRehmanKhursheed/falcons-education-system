'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { reportError } from '@/lib/observability';

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { tags: { surface: 'app-segment' }, extra: { digest: error.digest } });
  }, [error]);

  return (
    <div className="relative max-w-xl mx-auto mt-12">
      <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
      <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
      <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
      <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

      <div className="border border-line bg-surface rounded-md px-8 py-14 sm:px-12 sm:py-16 text-center">
        <AlertTriangle className="w-7 h-7 mx-auto text-danger" strokeWidth={1.25} />

        <p className="mt-6 eyebrow text-ink-faint">Error · this page</p>
        <h2
          className="mt-3 font-display text-3xl sm:text-4xl text-ink"
          style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
        >
          Something went wrong.
        </h2>
        <p className="mt-4 max-w-md mx-auto text-[14px] text-ink-soft leading-[1.65]">
          We could not load this section. The rest of the portal is still available — try the action again, or jump back to the dashboard.
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
  );
}
