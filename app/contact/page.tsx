import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { Contact } from '@/components/Contact';
import { FadeIn } from '@/components/ui/Motion';

export const metadata: Metadata = {
  title: 'Contact Us — Visit Falcons Education System Rawalpindi',
  description:
    'Contact Falcons Education System on Kamalabad Road, Rawalpindi. Get directions, call us, WhatsApp, or visit for a free campus tour. Admissions open 2026.',
  alternates: { canonical: `${SITE_CONFIG.url}/contact` },
  openGraph: {
    title: 'Contact Falcons Education System — Kamalabad Road, Rawalpindi',
    description:
      'Visit our campus, call, or WhatsApp us. Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi.',
    url: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-paper pb-2 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Come say <span className="text-brand">salaam</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Message, call, or just walk in during school hours — no appointment needed for a
              campus tour.
            </p>
          </FadeIn>
        </div>
      </section>

      <Contact />

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-paper-warm px-7 py-9 sm:flex-row sm:items-center md:px-10">
              <div>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">
                  Questions before visiting?
                </h2>
                <p className="mt-1 text-ink-muted">
                  Admissions, timings, fees, Montessori — quick answers on the FAQ page.
                </p>
              </div>
              <Link
                href="/faq"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                View FAQ
                <ArrowRight size={17} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
