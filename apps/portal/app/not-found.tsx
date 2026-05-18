import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-lg">
        {/* Corner marks — same language as ComingSoon */}
        <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
        <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
        <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
        <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

        <div className="border border-line bg-surface rounded-md px-8 py-16 sm:px-12 sm:py-20 text-center">
          <Compass className="w-7 h-7 mx-auto text-accent" strokeWidth={1.25} />

          <p className="mt-6 eyebrow text-ink-faint">Error · 404</p>
          <h1
            className="mt-3 font-display text-4xl sm:text-5xl text-ink"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Page not found.
          </h1>
          <p className="mt-4 max-w-md mx-auto text-[14px] text-ink-soft leading-[1.65]">
            The page you are looking for has moved, been renamed, or never existed. Use the dashboard to find your way back.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-sm bg-ink text-paper px-4 py-2 text-[13px] font-medium transition hover:bg-ink-soft"
            >
              Go to dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-sm border border-line text-ink-soft px-4 py-2 text-[13px] font-medium transition hover:bg-surface-3"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
