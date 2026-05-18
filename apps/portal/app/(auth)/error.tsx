'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { reportError } from '@/lib/observability';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { tags: { surface: 'auth' }, extra: { digest: error.digest } });
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-md">
        <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
        <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
        <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
        <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

        <div className="border border-line bg-surface rounded-md px-8 py-14 text-center">
          <ShieldAlert className="w-7 h-7 mx-auto text-danger" strokeWidth={1.25} />

          <p className="mt-6 eyebrow text-ink-faint">Sign-in · error</p>
          <h1
            className="mt-3 font-display text-3xl sm:text-4xl text-ink"
            style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
          >
            Sign-in failed.
          </h1>
          <p className="mt-4 max-w-sm mx-auto text-[14px] text-ink-soft leading-[1.65]">
            We could not complete that request. Your credentials were not changed. Try again, or contact your administrator if the problem persists.
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
              href="/login"
              className="inline-flex items-center justify-center rounded-sm border border-line text-ink-soft px-4 py-2 text-[13px] font-medium transition hover:bg-surface-3"
            >
              Back to sign in
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
