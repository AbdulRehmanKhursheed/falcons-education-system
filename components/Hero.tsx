import Link from 'next/link';
import { ArrowUpRight, MapPin, Phone, GraduationCap } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const brief: Array<{ label: string; value: string }> = [
  { label: 'Founded',     value: '2024' },
  { label: 'Ages',        value: '2.5 – 12' },
  { label: 'Programs',    value: 'Nursery → Class 6' },
  { label: 'Coaching',    value: 'Evening · Saturday' },
];

export function Hero() {
  return (
    <section
      className="relative bg-paper grain"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20 lg:pt-28 pb-20 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── Editorial column ─────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <FadeIn>
              <Eyebrow number="01">Admissions Open · Session 2026</Eyebrow>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1
                id="hero-heading"
                className="mt-6 font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[5.5rem] lg:leading-[0.98] text-ink"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
              >
                A quieter, more deliberate place to{' '}
                <span className="italic text-accent" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                  begin
                </span>
                .
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink-soft leading-[1.55]">
                Falcons Education System is a Montessori-rooted school in Rawalpindi —
                nursery through Class 6, with evening coaching and computer courses
                for school-going children.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href="/admissions"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-[15px] font-semibold text-paper transition-all hover:bg-brand-dark hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  Apply for admission
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </Link>

                <Link
                  href="/programs"
                  className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink underline decoration-line decoration-1 underline-offset-[6px] hover:text-brand hover:decoration-brand transition-colors"
                >
                  Explore programs
                </Link>
              </div>
            </FadeIn>

            {/* Meta row — location + phone, set as editorial footnote */}
            <FadeIn delay={0.28}>
              <div className="mt-14 flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-3 text-sm text-ink-muted">
                <Link href="/contact" className="inline-flex items-center gap-2 hover:text-ink transition-colors">
                  <MapPin className="h-4 w-4 text-accent" strokeWidth={1.75} />
                  <span>Kamalabad Road, Rawalpindi</span>
                </Link>
                <span className="hidden sm:inline h-3 w-px bg-line" aria-hidden />
                <a href={`tel:${SITE_CONFIG.phone}`} className="inline-flex items-center gap-2 hover:text-ink transition-colors">
                  <Phone className="h-4 w-4 text-accent" strokeWidth={1.75} />
                  <span className="font-mono tracking-tight">{SITE_CONFIG.phone}</span>
                </a>
              </div>
            </FadeIn>
          </div>

          {/* ── Brief card — magazine sidebar ─────────────────────────────── */}
          <FadeIn delay={0.18} className="lg:col-span-5 lg:pl-4">
            <aside className="relative">
              {/* Corner accent — small editorial mark */}
              <span aria-hidden className="absolute -top-3 -left-3 h-6 w-6 border-t border-l border-accent/60" />
              <span aria-hidden className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-accent/60" />

              <div className="rounded-lg border border-line bg-paper-warm/60 backdrop-blur-[2px] p-8 sm:p-10 shadow-paper">
                <div className="flex items-baseline justify-between border-b border-line pb-5">
                  <p className="font-display text-2xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                    The Brief
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    Issue · 01
                  </p>
                </div>

                <dl className="mt-2 divide-y divide-line/70">
                  {brief.map(({ label, value }) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 py-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                        {label}
                      </dt>
                      <dd className="font-display text-lg text-ink text-right" style={{ fontVariationSettings: '"opsz" 24' }}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <Link
                  href="/admissions"
                  className="mt-2 group inline-flex items-center justify-between w-full rounded-md border border-line bg-paper px-5 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink hover:border-ink hover:bg-ink hover:text-paper transition-all"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
                    Begin application
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
                </Link>
              </div>

              {/* Quiet meta below card */}
              <p className="mt-5 text-xs text-ink-faint pl-1">
                Limited seats for 2026 · Visits by appointment
              </p>
            </aside>
          </FadeIn>
        </div>
      </div>

      {/* Hairline bottom rule — editorial section divider */}
      <div className="border-t border-line" aria-hidden />
    </section>
  );
}
