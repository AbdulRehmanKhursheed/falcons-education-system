'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { ArrowUpRight, GraduationCap, KeyRound, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // TODO Phase 2 — wire to NextAuth credentials provider.
    // For now this is UI-only; redirect to dashboard so the layout is reachable.
    await new Promise((r) => setTimeout(r, 500));
    window.location.href = '/dashboard';
  }

  const fieldClasses =
    'w-full pl-11 pr-4 py-3.5 rounded-md border border-line bg-paper-pure text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors';

  return (
    <div className="grid lg:grid-cols-2 min-h-screen">

      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12 xl:p-16 relative">
        <Link href="/" className="inline-flex items-center gap-3 w-fit group">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-paper/10">
            <GraduationCap className="w-5 h-5 text-paper" strokeWidth={1.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl text-paper tracking-[-0.02em]" style={{ fontVariationSettings: '"opsz" 24' }}>
              Falcons
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/60">
              School portal
            </span>
          </span>
        </Link>

        <div>
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft mb-8">
            <span className="inline-block h-px w-7 bg-accent-soft/60" aria-hidden />
            Internal access
          </p>
          <h1 className="font-display text-5xl xl:text-6xl text-paper leading-[1.02] tracking-[-0.025em]" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
            Running a school is{' '}
            <span className="italic text-accent-soft" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
              quiet work
            </span>
            .
          </h1>
          <p className="mt-8 max-w-md text-paper/70 leading-[1.7] text-[15px]">
            Admissions, attendance, fees, assessments — in one calm interface.
            Built for the people who actually run the school, not the people who
            buy the software.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.16em] font-semibold text-paper/40">
          <span>Falcons Education System</span>
          <span aria-hidden>·</span>
          <span>Kamalabad Road · Rawalpindi</span>
        </div>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile-only brand */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-10">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-ink text-paper">
              <GraduationCap className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <span className="font-display text-xl text-ink tracking-[-0.02em]" style={{ fontVariationSettings: '"opsz" 24' }}>
              Falcons Portal
            </span>
          </Link>

          <p className="eyebrow text-accent mb-4">Sign in</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink leading-[1.1]" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
            Welcome back.
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-soft leading-[1.6]">
            Sign in to manage admissions, attendance, fees, and assessments.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="email" className="block eyebrow text-ink-faint mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@falconseducationsystem.com"
                  className={fieldClasses}
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="password" className="block eyebrow text-ink-faint">
                  Password
                </label>
                <Link href="#" className="text-[11px] text-ink-muted hover:text-brand underline decoration-line decoration-1 underline-offset-[5px]">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={1.5} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className={fieldClasses}
                />
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-danger bg-danger-soft border border-danger/20 px-4 py-2.5 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[14px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-70 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </>
              )}
            </button>

            <p className="text-center text-[11.5px] text-ink-faint mt-5">
              Trouble signing in? Contact{' '}
              <a href="mailto:admin@falconseducationsystem.com" className="text-ink underline decoration-line decoration-1 underline-offset-[5px] hover:text-brand hover:decoration-brand transition-colors">
                admin@falconseducationsystem.com
              </a>
            </p>
          </form>

          <p className="mt-12 text-center text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-faint">
            Authorized personnel only
          </p>
        </div>
      </main>
    </div>
  );
}
