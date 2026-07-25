'use client';

import { MessageCircle, CalendarCheck, PenLine, ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { trackLead } from '@/components/MetaPixel';

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Say salaam',
    body: 'Message us on WhatsApp or call — we reply the same day.',
  },
  {
    icon: CalendarCheck,
    title: 'Visit the school',
    body: 'Walk through the classrooms and meet the teachers, by appointment.',
  },
  {
    icon: PenLine,
    title: 'Enrol your child',
    body: 'A short form and your child’s documents — done in one visit.',
  },
];

export function AdmissionsStrip() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+enquire+about+admissions+at+Falcons+Education+System.`;

  return (
    <section className="bg-paper py-20 md:py-28" aria-labelledby="admissions-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <h2 id="admissions-heading" className="max-w-2xl text-4xl font-extrabold text-ink sm:text-5xl">
            Joining is <span className="text-brand">three easy steps</span>
          </h2>
        </FadeIn>

        <Stagger className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* connecting line */}
          <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-3rem)] bg-line md:block" aria-hidden="true" />
          {STEPS.map((s) => (
            <StaggerItem key={s.title} className="relative">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-paper">
                <s.icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-ink">{s.title}</h3>
              <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* CTA band */}
        <FadeIn className="mt-16 md:mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-navy px-7 py-12 text-center shadow-rise md:px-16 md:py-16">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 900 300"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path
                d="M-30 260 C 200 210, 340 80, 560 110 S 860 40, 940 10"
                stroke="#1CA7E8"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="1 10"
                strokeLinecap="round"
              />
              <circle cx="560" cy="110" r="4" fill="#FFC53D" fillOpacity="0.8" />
            </svg>
            <h3 className="relative text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              Seats for 2026 are <span className="text-sun">filling up</span>
            </h3>
            <p className="relative mx-auto mt-4 max-w-xl text-white/65">
              One message is all it takes. Ask anything — fees, timings, syllabus — and book a
              visit when you&apos;re ready.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLead('home-cta-band-whatsapp')}
                className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                Chat on WhatsApp
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
              >
                Call {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
