import Link from 'next/link';
import {
  Sparkles,
  GraduationCap,
  Moon,
  MonitorPlay,
  Users,
  MessageSquare,
  ArrowUpRight,
  ImageIcon,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const principles = [
  {
    Icon: Sparkles,
    title: 'Authentic Montessori method',
    body: 'Hands-on, self-directed exploration with prepared environments. Children move at their own pace through real materials, not flashcards on a screen.',
  },
  {
    Icon: GraduationCap,
    title: 'Primary up to Class 6',
    body: 'A full primary curriculum following the national syllabus — English, Urdu, Mathematics, Science, Islamic Studies — taught in small classes with individual attention.',
  },
  {
    Icon: Moon,
    title: 'Evening coaching academy',
    body: 'Monday to Friday, 3:30 – 7:30 PM. After-school support for children attending other schools — exam prep, concept-strengthening, supervised homework.',
  },
  {
    Icon: MonitorPlay,
    title: 'Computer courses for kids',
    body: 'A real introduction to digital literacy — typing, MS Word, internet fundamentals. The skills children need before they need them.',
  },
  {
    Icon: Users,
    title: 'Small class sizes',
    body: 'Teachers know every child. Every child gets the individual attention that lets them be seen, heard, and properly supported.',
  },
  {
    Icon: MessageSquare,
    title: 'Open parent communication',
    body: 'Reach us directly on WhatsApp at 0311-9911288. Open visits, regular updates, no bureaucracy between you and your child\'s teacher.',
  },
];

const measures = [
  { value: '2024', label: 'Founded' },
  { value: 'Nursery → 6', label: 'Programs' },
  { value: '2.5 – 12', label: 'Age range' },
  { value: '6 days', label: 'Open per week' },
];

export function About() {
  return (
    <section
      id="about"
      className="relative bg-paper-warm/40"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        {/* ── Editorial introduction ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">

          <FadeIn className="lg:col-span-5">
            <Eyebrow number="02">The school</Eyebrow>
            <h2
              id="about-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Where learning begins{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                with intention
              </span>
              .
            </h2>

            <div className="mt-8 space-y-5 text-ink-soft text-[1.05rem] leading-[1.7] max-w-md">
              <p>
                Falcons Education System is a quiet, deliberate school on Kamalabad Road —
                rooted in Montessori principles and built around the rhythms of childhood,
                not the demands of a syllabus.
              </p>
              <p>
                We teach from nursery through Class 6, and offer after-school coaching for
                children attending other schools. The work is the same in either room:
                attention, repetition, and the right material at the right moment.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-x-6 gap-y-3 flex-wrap">
              <Link
                href="/admissions"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-paper hover:bg-brand-dark transition-colors"
              >
                Apply for admission
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
              </Link>
              <a href={`tel:${SITE_CONFIG.phone}`} className="text-[15px] font-medium text-ink underline decoration-line decoration-1 underline-offset-[6px] hover:text-brand hover:decoration-brand transition-colors">
                Or call to visit
              </a>
            </div>
          </FadeIn>

          {/* ── Editorial image frame ──────────────────────────────────── */}
          <FadeIn delay={0.1} className="lg:col-span-7 lg:pl-4">
            <div className="relative">
              {/* Corner marks */}
              <span aria-hidden className="absolute -top-2 -left-2 h-5 w-5 border-t border-l border-accent" />
              <span aria-hidden className="absolute -top-2 -right-2 h-5 w-5 border-t border-r border-accent" />
              <span aria-hidden className="absolute -bottom-2 -left-2 h-5 w-5 border-b border-l border-accent" />
              <span aria-hidden className="absolute -bottom-2 -right-2 h-5 w-5 border-b border-r border-accent" />

              <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden bg-paper border border-line">
                {/* Intentional placeholder — looks like a print layout proof */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center max-w-sm px-8">
                    <ImageIcon className="h-7 w-7 mx-auto text-ink-faint" strokeWidth={1.25} />
                    <p className="mt-5 font-display text-2xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                      Plate · 01
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-faint font-semibold">
                      Photography forthcoming
                    </p>
                  </div>
                </div>

                {/* Grid overlay for editorial texture */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px),
                                       linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                  }}
                />
              </div>

              {/* Caption bar */}
              <div className="mt-4 flex items-baseline justify-between text-[12px] text-ink-faint">
                <p className="uppercase tracking-[0.18em] font-semibold">Campus · Kamalabad</p>
                <p className="font-mono">{SITE_CONFIG.address.city}, PK</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Measures (replaces stat boxes) ─────────────────────────────── */}
        <FadeIn className="border-y border-line py-10 mb-24">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            {measures.map(({ value, label }) => (
              <div key={label} className="text-center lg:text-left">
                <dd className="font-display text-3xl sm:text-4xl text-ink leading-none" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
                  {value}
                </dd>
                <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </FadeIn>

        {/* ── Principles grid ────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Eyebrow number="03" className="justify-center inline-flex">Why Falcons</Eyebrow>
          <h3 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1]" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
            Six things we hold to.
          </h3>
        </div>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {principles.map(({ Icon, title, body }) => (
            <StaggerItem key={title} className="bg-paper p-8 lg:p-10 hover:bg-paper-warm transition-colors">
              <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h4 className="mt-6 font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                {title}
              </h4>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-[1.65]">
                {body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
