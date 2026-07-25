import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, CalendarCheck, PenLine, FileText, ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { InquiryForm } from '@/components/admissions/InquiryForm';

export const metadata: Metadata = {
  title: 'Admissions Open 2026 — School Play Group to Class 6 | Falcons Education System Rawalpindi',
  description:
    'Apply for admission at Falcons Education System Rawalpindi. School from Play Group to Class 6, plus Evening Coaching Academy up to Matric. Limited seats for 2026. Apply today!',
  alternates: { canonical: `${SITE_CONFIG.url}/admissions` },
  openGraph: {
    title: 'Admissions Open 2026 — Falcons Education System Rawalpindi',
    description:
      'Enroll your child in school from Play Group to Class 6, plus evening coaching up to Matric at Falcons Education System, Rawalpindi. Limited seats!',
    url: `${SITE_CONFIG.url}/admissions`,
  },
};

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Say salaam',
    body: 'Send the inquiry form below, or message us directly on WhatsApp. We reply the same day.',
  },
  {
    icon: CalendarCheck,
    title: 'Visit the school',
    body: 'Book a time, walk through the classrooms, meet the teachers, and ask everything.',
  },
  {
    icon: PenLine,
    title: 'Enrol your child',
    body: 'A short admission form and your child’s documents — usually done in one visit.',
  },
];

const DOCUMENTS = [
  'Child’s B-Form (birth registration)',
  'Parent/guardian CNIC copy',
  '2 passport-size photographs',
  'Previous school report card (Class 1 onwards)',
];

const PROGRAM_LIST = [
  { name: 'Play Group · Nursery · KG', age: '3 – 6 yrs' },
  { name: 'Class 1 & 2', age: '5 – 7 yrs' },
  { name: 'Class 3 & 4', age: '7 – 9 yrs' },
  { name: 'Class 5 & 6', age: '9 – 12 yrs' },
  { name: 'Evening Coaching Academy', age: 'Play Group – Matric' },
  { name: 'Spoken English', age: 'School-going' },
  { name: 'Computer Courses', age: 'Young students' },
];

export default function AdmissionsPage() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+enquire+about+admissions+at+Falcons+Education+System.`;

  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full bg-sun-soft px-4 py-1.5 text-sm font-extrabold text-ink">
              <span className="inline-block h-2 w-2 rounded-full bg-flame" />
              Session 2026 · Limited seats
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Admission, <span className="text-brand">without the hassle</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              No test anxiety, no long queues. One message starts it; one visit usually finishes
              it.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-20" aria-label="How admission works">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Stagger className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-3rem)] bg-line md:block" aria-hidden="true" />
            {STEPS.map((s) => (
              <StaggerItem key={s.title} className="relative">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-paper">
                  <s.icon size={22} />
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-ink">{s.title}</h2>
                <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper-warm py-16 md:py-24" aria-label="Inquiry form">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-5 md:gap-16 md:px-8">
          <FadeIn className="md:col-span-3">
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">Start with one message</h2>
            <p className="mt-3 max-w-md text-ink-muted">
              Fill this in and it opens WhatsApp with your details ready to send — nothing is
              stored on the website.
            </p>
            <div className="mt-8">
              <InquiryForm />
            </div>
          </FadeIn>

          <div className="md:col-span-2">
            <FadeIn>
              <div className="rounded-3xl border border-line bg-white p-7 shadow-paper">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                  <FileText size={19} className="text-brand" />
                  Documents to bring
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {DOCUMENTS.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-ink-faint">
                  Fee details are shared at the school or on WhatsApp — they differ by program.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-6 rounded-3xl border border-line bg-white p-7 shadow-paper">
                <h3 className="text-lg font-extrabold text-ink">Open for admission</h3>
                <ul className="mt-4 grid grid-cols-1 gap-2">
                  {PROGRAM_LIST.map((p) => (
                    <li key={p.name} className="flex items-center justify-between text-[0.9375rem]">
                      <span className="font-semibold text-ink-soft">{p.name}</span>
                      <span className="text-ink-faint">{p.age}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/programs"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
                >
                  Program details
                  <ArrowRight size={15} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Prefer to just talk?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                Call {SITE_CONFIG.phone} or {SITE_CONFIG.phonePTCL} — or walk in any school-day
                morning.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
                >
                  Call the school
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
