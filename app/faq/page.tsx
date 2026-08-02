import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { faqSchema } from '@/lib/schema';
import { FAQ } from '@/components/FAQ';
import { FadeIn } from '@/components/ui/Motion';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions About Our School',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="bg-paper pb-2 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Asked &amp; <span className="text-brand">answered</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Admissions, timings, fees, the Montessori method — the questions every parent asks,
              answered straight.
            </p>
          </FadeIn>
        </div>
      </section>

      <FAQ />
    </>
  );
}
