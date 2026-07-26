import type { Metadata } from 'next';
import { BookOpen, CalendarDays, Download, FileText, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { RESOURCES, type ResourceYear } from '@/lib/resources-data';
import { FadeIn } from '@/components/ui/Motion';

export const metadata: Metadata = {
  title: 'Syllabus & Date Sheets — Every Class, Every Year',
  description:
    'Download the syllabus and exam date sheets for every class at Falcons Education System, Rawalpindi. Current session plus previous years, all in one place.',
  alternates: { canonical: `${SITE_CONFIG.url}/syllabus` },
  openGraph: {
    title: 'Syllabus & Date Sheets — Falcons Education System Rawalpindi',
    description:
      'Course outlines and exam date sheets for Play Group to Class 6 — current year and previous years.',
    url: `${SITE_CONFIG.url}/syllabus`,
  },
};

function DocRow({ title, file, note }: { title: string; file?: string; note?: string }) {
  if (!file) {
    return (
      <li className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
        <span className="flex items-start gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-ink-faint" />
          <span>
            <span className="font-semibold text-ink-muted">{title}</span>
            {note && <span className="block text-xs text-ink-faint">{note}</span>}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-paper-warm px-3 py-1 text-xs font-bold text-ink-faint">
          Coming soon
        </span>
      </li>
    );
  }

  return (
    <li className="border-b border-line last:border-0">
      <a
        href={file}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 py-3.5"
      >
        <span className="flex items-start gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-brand" />
          <span>
            <span className="font-semibold text-ink group-hover:text-brand-dark">{title}</span>
            {note && <span className="block text-xs text-ink-faint">{note}</span>}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-extrabold text-brand-dark transition-colors group-hover:bg-brand group-hover:text-white">
          <Download size={13} />
          PDF
        </span>
      </a>
    </li>
  );
}

function YearBlock({ group }: { group: ResourceYear }) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 md:p-7 ${
        group.current ? 'border-2 border-brand-tint shadow-card' : 'border border-line shadow-paper'
      }`}
    >
      <div className="flex items-center justify-between gap-3 pb-1">
        <h3 className="text-xl font-extrabold text-ink">{group.year}</h3>
        {group.current && (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold text-brand-dark">
            Current session
          </span>
        )}
      </div>
      <ul className="mt-2">
        {group.docs.map((d) => (
          <DocRow key={d.title} {...d} />
        ))}
      </ul>
    </div>
  );
}

function ResourceSection({
  id,
  icon: Icon,
  heading,
  years,
}: {
  id: string;
  icon: typeof BookOpen;
  heading: string;
  years: ResourceYear[];
}) {
  const current = years.filter((y) => y.current);
  const previous = years.filter((y) => !y.current);

  return (
    <section className="scroll-mt-28 bg-paper py-12 md:py-16" id={id} aria-labelledby={`${id}-heading`}>
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <FadeIn>
          <h2
            id={`${id}-heading`}
            className="flex items-center gap-2.5 text-2xl font-extrabold text-ink md:text-3xl"
          >
            <Icon size={26} className="text-brand" />
            {heading}
          </h2>
        </FadeIn>

        <div className="mt-6 flex flex-col gap-5">
          {current.map((g) => (
            <FadeIn key={g.year}>
              <YearBlock group={g} />
            </FadeIn>
          ))}
        </div>

        {previous.length > 0 && (
          <>
            <FadeIn>
              <h3 className="mt-10 text-sm font-extrabold uppercase tracking-wide text-ink-faint">
                Previous years
              </h3>
            </FadeIn>
            <div className="mt-4 flex flex-col gap-5">
              {previous.map((g) => (
                <FadeIn key={g.year}>
                  <YearBlock group={g} />
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function SyllabusPage() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+could+you+please+share+the+syllabus+or+date+sheet+for+my+child%27s+class%3F`;

  return (
    <>
      <section className="bg-paper pb-4 pt-14 md:pt-24">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <FadeIn>
            <h1 className="text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Syllabus &amp; <span className="text-brand">date sheets</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              {RESOURCES.intro}
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#syllabus"
                className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white"
              >
                <BookOpen size={16} />
                Syllabus
              </a>
              <a
                href="#date-sheets"
                className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white"
              >
                <CalendarDays size={16} />
                Date sheets
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <ResourceSection id="syllabus" icon={BookOpen} heading="Syllabus" years={RESOURCES.syllabus} />

      <ResourceSection
        id="date-sheets"
        icon={CalendarDays}
        heading="Exam date sheets"
        years={RESOURCES.dateSheets}
      />

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-navy px-7 py-10 sm:flex-row sm:items-center md:px-12">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Can&apos;t find what you need?
                </h2>
                <p className="mt-2 max-w-md text-white/65">
                  Message us your child&apos;s class and we will send the syllabus or date sheet
                  to you directly.
                </p>
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                <MessageCircle size={18} />
                Ask on WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
