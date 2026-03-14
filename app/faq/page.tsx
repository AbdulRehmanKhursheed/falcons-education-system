import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { FAQ } from '@/components/FAQ';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions About Our School',
  description:
    'Answers to common questions about Falcons Education System Rawalpindi: admissions, school timings, Montessori method, programs, fees, and more.',
  alternates: { canonical: `${SITE_CONFIG.url}/faq` },
  openGraph: {
    title: 'FAQ — Falcons Education System Rawalpindi',
    description: 'Common questions about admissions, programs, Montessori method, and school timings.',
    url: `${SITE_CONFIG.url}/faq`,
  },
};

export default function FAQPage() {
  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Everything you need to know about Falcons Education System — admissions, programs,
            timings, and the Montessori method.
          </p>
        </div>
      </section>

      <FAQ />
    </>
  );
}
