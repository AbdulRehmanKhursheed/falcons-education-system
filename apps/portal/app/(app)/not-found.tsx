import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function AppNotFound() {
  return (
    <div className="relative max-w-xl mx-auto mt-12">
      <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
      <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
      <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
      <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

      <div className="border border-line bg-surface rounded-md px-8 py-14 sm:px-12 sm:py-16 text-center">
        <Compass className="w-7 h-7 mx-auto text-accent" strokeWidth={1.25} />

        <p className="mt-6 eyebrow text-ink-faint">Error · 404</p>
        <h2
          className="mt-3 font-display text-3xl sm:text-4xl text-ink"
          style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
        >
          We could not find that.
        </h2>
        <p className="mt-4 max-w-md mx-auto text-[14px] text-ink-soft leading-[1.65]">
          This record may have been removed, renamed, or never existed. Use the sidebar to navigate, or return to the dashboard.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-sm bg-ink text-paper px-4 py-2 text-[13px] font-medium transition hover:bg-ink-soft"
          >
            Go to dashboard
          </Link>
          <Link
            href="/students"
            className="inline-flex items-center justify-center rounded-sm border border-line text-ink-soft px-4 py-2 text-[13px] font-medium transition hover:bg-surface-3"
          >
            View students
          </Link>
        </div>
      </div>
    </div>
  );
}
