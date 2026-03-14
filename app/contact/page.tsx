import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { Contact } from '@/components/Contact';

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
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">Get In Touch</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Visit Falcons Education System
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            We&apos;d love to meet you and your child. Come for a free campus tour, or reach out
            via WhatsApp, phone, or email. No appointment needed during school hours.
          </p>
        </div>
      </section>

      <Contact />

      {/* FAQ link */}
      <section className="py-12 bg-falcon-cream text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-4">
            Have Questions Before Visiting?
          </h2>
          <p className="text-falcon-earth mb-6">
            Check our frequently asked questions page for quick answers about admissions, timings, programs, and more.
          </p>
          <a
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-bold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
          >
            <span aria-hidden>❓</span> View FAQ
          </a>
        </div>
      </section>
    </>
  );
}
