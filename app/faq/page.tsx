import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema, breadcrumbSchema } from '@/lib/schema';
import { FAQ } from '@/components/FAQ';
import { HeroReveal } from '@/components/ui/HeroReveal';

export const metadata: Metadata = {
  title: 'FAQ – Admissions, Timings & Fees',
  description:
    'Answers to common questions about Falcons Education System Rawalpindi: admissions, school timings, Montessori method, programs, fees, and more.',
  alternates: { canonical: `${SITE_CONFIG.url}/faq` },
  openGraph: {
    title: 'FAQ — Falcons Education System Rawalpindi',
    description:
      'Common questions about admissions, programs, Montessori method, and school timings.',
    url: `${SITE_CONFIG.url}/faq`,
  },
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'FAQ', path: '/faq' }])} />
      <JsonLd data={faqSchema} />
      <section className="bg-paper pb-2 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <HeroReveal>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Asked &amp; <span className="text-brand">answered</span>
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Admissions, timings, fees, the Montessori method — the questions every parent asks,
              answered straight.
            </p>
          </HeroReveal>
        </div>
      </section>

      <FAQ />
    </>
  );
}
