import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Heart, Users, Shield, Sprout, Globe, TrendingUp } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

export const metadata: Metadata = {
  title: 'About Us — School Nursery to Class 6 in Rawalpindi',
  description:
    'Learn about Falcons Education System — a school on Kamalabad Road, Rawalpindi offering classes from Nursery to Class 6, plus Evening Coaching and Computer Courses. Founded August 2024.',
  alternates: { canonical: `${SITE_CONFIG.url}/about` },
  openGraph: {
    title: 'About Falcons Education System — School Nursery to Class 6, Rawalpindi',
    description:
      'Quality school education from Nursery to Class 6, Saturday coaching, and evening academy on Kamalabad Road, Rawalpindi. Founded August 2024.',
    url: `${SITE_CONFIG.url}/about`,
  },
};

const VALUES = [
  {
    icon: Sprout,
    title: 'Child-centered learning',
    text: 'Every child learns at their own pace through hands-on exploration, not one-speed lectures.',
  },
  {
    icon: Heart,
    title: 'Love & respect',
    text: 'Warmth, patience and genuine care — children learn best where they feel safe being themselves.',
  },
  {
    icon: Users,
    title: 'Parent partnership',
    text: 'Regular updates, open communication, and walk-in visits. You always know how your child is doing.',
  },
  {
    icon: Globe,
    title: 'Whole-child development',
    text: 'Mind, body, creativity and character — we prepare children for life, not just exams.',
  },
  {
    icon: Shield,
    title: 'Safe environment',
    text: 'Clean, secure, thoughtfully designed classrooms where children feel free to explore.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous growth',
    text: 'We keep improving our curriculum, materials and teaching — the school learns too.',
  },
];

const MILESTONES = [
  { year: '2024', event: 'Founded in August on Kamalabad Road — Nursery, Montessori, KG and Class 1–6 from day one' },
  { year: '2025', event: 'Evening Coaching Academy and Saturday Coaching launched, open to children from any school' },
  { year: '2025', event: 'Computer courses for kids added' },
  { year: '2026', event: 'Session 2026 admissions open — a growing community of families' },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              A small school with a <span className="text-brand">big promise</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Falcons Education System opened in August 2024 with one belief: every child deserves
              a joyful start — and a teacher who actually knows them.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:gap-14 md:px-8">
          <FadeIn>
            <Photo
              alt="Falcons Education System campus on Kamalabad Road, Rawalpindi"
              label="Campus photo — coming soon"
              tone="sky"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/3] w-full rounded-3xl shadow-card"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">Our story</h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              We&apos;re on Street 14, Sonari Bank, Kamalabad Road — near Bakra Mandi, Rawalpindi. The
              journey starts in our Montessori rooms (Nursery, Montessori Level, KG) and continues
              through primary school to Class 6 on the national curriculum.
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">
              After the school day ends, the building keeps teaching: the Evening Coaching Academy
              runs 3:30–7:30 PM on weekdays, Saturday Coaching runs 9 AM–1 PM, and computer
              courses give young students their first real digital skills — all open to children
              from any school in the area.
            </p>
            <Link
              href="/programs"
              className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand hover:text-brand-dark"
            >
              See all programs
              <ArrowRight size={17} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper-warm py-16 md:py-24" aria-labelledby="values-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="values-heading" className="text-3xl font-extrabold text-ink md:text-4xl">
              What we <span className="text-brand">stand for</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-2xl bg-white p-6 shadow-paper">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <v.icon size={21} />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-ink">{v.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{v.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <FadeIn>
            <h2 id="journey-heading" className="text-3xl font-extrabold text-ink md:text-4xl">
              The journey so far
            </h2>
          </FadeIn>
          <Stagger className="mt-10 flex flex-col gap-8">
            {MILESTONES.map((m, i) => (
              <StaggerItem key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
                    {m.year}
                  </span>
                  {i < MILESTONES.length - 1 && <span className="mt-2 w-0.5 flex-1 bg-line" />}
                </div>
                <p className="pt-3 leading-relaxed text-ink-soft">{m.event}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Come see it for yourself
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                The best way to judge a school is to walk through it on a working morning.
                You&apos;re welcome any day.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  Apply for admission
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
                >
                  Plan a visit
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
