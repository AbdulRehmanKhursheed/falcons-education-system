import type { Metadata } from 'next';
import { ArrowRight, Bell, Clock, MessageCircle, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { COACHING } from '@/lib/coaching-data';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

export const metadata: Metadata = {
  title: 'Coaching Academy — Evening Coaching, Play Group to Matric | Rawalpindi',
  description:
    'Falcons Evening Coaching Academy, Kamalabad Road Rawalpindi: coaching for Play Group to Matric from any school, Mon–Sat 3:30–7:00 PM. Spoken English and computer courses. Admissions, timings and updates — all here.',
  alternates: { canonical: `${SITE_CONFIG.url}/coaching` },
  openGraph: {
    title: 'Coaching Academy — Falcons Education System Rawalpindi',
    description:
      'Evening coaching for Play Group to Matric, Mon–Sat 3:30–7:00 PM. Admissions open — timings, courses and updates on one page.',
    url: `${SITE_CONFIG.url}/coaching`,
  },
};

const STATUS_STYLES = {
  open: { label: 'Admissions open', classes: 'bg-brand-soft text-brand-dark' },
  'starting-soon': { label: 'Starting soon', classes: 'bg-sun-soft text-ink' },
  full: { label: 'Currently full', classes: 'bg-flame-soft text-flame' },
} as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CoachingPage() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+ask+about+the+Evening+Coaching+Academy.`;

  return (
    <>
      {/* Hero */}
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          {COACHING.admissionsOpen && (
            <FadeIn>
              <p className="inline-flex items-center gap-2 rounded-full bg-sun-soft px-4 py-1.5 text-sm font-extrabold text-ink">
                <span className="inline-block h-2 w-2 rounded-full bg-flame" />
                {COACHING.admissionBadge}
              </p>
            </FadeIn>
          )}
          <FadeIn delay={0.08}>
            <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              The <span className="text-brand">Coaching Academy</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Evening coaching for children from <strong>any school</strong> — Play Group to
              Matric. Timings, courses, admissions and every update, all on this one page.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Notice board */}
      <section className="bg-paper py-10 md:py-14" aria-labelledby="notices-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="notices-heading" className="flex items-center gap-2.5 text-2xl font-extrabold text-ink md:text-3xl">
              <Bell size={24} className="text-brand" />
              Latest updates
            </h2>
          </FadeIn>
          <Stagger className="mt-6 flex flex-col gap-4">
            {COACHING.notices.map((n) => (
              <StaggerItem key={n.date + n.title}>
                <article className="rounded-2xl border-l-4 border-brand bg-paper-warm p-6">
                  <time className="text-xs font-bold text-ink-faint" dateTime={n.date}>
                    {formatDate(n.date)}
                  </time>
                  <h3 className="mt-1 text-lg font-extrabold text-ink">{n.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-muted">{n.text}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Courses + timings side by side */}
      <section className="bg-paper py-10 md:py-14" aria-labelledby="courses-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-3 md:gap-8 md:px-8">
          <div className="md:col-span-2">
            <FadeIn>
              <h2 id="courses-heading" className="text-2xl font-extrabold text-ink md:text-3xl">
                The Academy
              </h2>
            </FadeIn>
            <Stagger className="mt-6 flex flex-col gap-4">
              {COACHING.academy.map((c) => {
                const status = STATUS_STYLES[c.status];
                return (
                  <StaggerItem key={c.name}>
                    <article className="rounded-2xl border-2 border-brand-tint bg-white p-6 shadow-paper">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-extrabold text-ink">{c.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status.classes}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
                        {c.description}
                      </p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft">
                        <Clock size={15} className="text-brand" />
                        {c.timing}
                      </p>
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>

            <FadeIn>
              <h2 className="mt-12 text-2xl font-extrabold text-ink md:text-3xl">
                Short courses <span className="text-brand">— separate from the academy</span>
              </h2>
              <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
                {COACHING.shortCoursesNote}
              </p>
            </FadeIn>
            <Stagger className="mt-6 flex flex-col gap-4">
              {COACHING.shortCourses.map((c) => {
                const status = STATUS_STYLES[c.status];
                return (
                  <StaggerItem key={c.name}>
                    <article className="rounded-2xl border border-line bg-white p-6 shadow-paper">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-extrabold text-ink">{c.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status.classes}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
                        {c.description}
                      </p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft">
                        <Clock size={15} className="text-brand" />
                        {c.timing}
                      </p>
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>

          <div>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl bg-navy p-6 text-white">
                <h2 className="flex items-center gap-2 text-lg font-extrabold">
                  <Clock size={19} className="text-sun" />
                  Timings
                </h2>
                <dl className="mt-4 flex flex-col gap-3">
                  {COACHING.timings.map((t) => (
                    <div key={t.label}>
                      <dt className="text-sm font-bold text-white/60">{t.label}</dt>
                      <dd className="text-[0.9375rem] font-semibold">{t.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </FadeIn>
            <FadeIn delay={0.18}>
              <Photo
                alt="Evening coaching session at Falcons Education System"
                src="/images/coaching.jpg"
                sizes="(min-width: 768px) 33vw, 100vw"
                className="mt-6 aspect-[4/3] w-full rounded-2xl shadow-paper"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Admission */}
      <section className="bg-paper-warm py-14 md:py-20" aria-labelledby="admission-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="admission-heading" className="text-2xl font-extrabold text-ink md:text-3xl">
              Admission is <span className="text-brand">one evening&apos;s work</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-8 grid gap-6 md:grid-cols-3">
            {COACHING.admission.steps.map((step, i) => (
              <StaggerItem key={i} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{step}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <FadeIn delay={0.15}>
            <p className="mt-8 flex items-start gap-2.5 text-sm text-ink-muted">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand" />
              {COACHING.admission.feeNote}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy px-7 py-10 sm:flex-row sm:items-center md:px-12">
              <div>
                <h2 className="text-2xl font-extrabold text-white md:text-3xl">
                  Ask about your child&apos;s class
                </h2>
                <p className="mt-2 max-w-md text-white/65">
                  Tell us the class and school — we&apos;ll suggest the right group and share the
                  fee the same day.
                </p>
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                <MessageCircle size={18} />
                WhatsApp the academy
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
