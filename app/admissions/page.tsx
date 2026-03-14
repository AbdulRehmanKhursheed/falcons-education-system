import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { Admissions } from '@/components/Admissions';
import { Testimonials } from '@/components/Testimonials';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admissions Open 2026 — Apply Now | Montessori School Rawalpindi',
  description:
    'Apply for admission at Falcons Education System Rawalpindi. Nursery, Montessori, KG, Saturday Coaching & Evening Academy. Limited seats for 2026. Apply today!',
  alternates: { canonical: `${SITE_CONFIG.url}/admissions` },
  openGraph: {
    title: 'Admissions Open 2026 — Falcons Education System Rawalpindi',
    description:
      'Enroll your child in Rawalpindi\'s trusted Montessori school. Nursery, KG, coaching & evening classes. Limited seats!',
    url: `${SITE_CONFIG.url}/admissions`,
  },
};

const reasons = [
  { icon: '🌱', text: 'Authentic Montessori curriculum with certified materials' },
  { icon: '👩‍🏫', text: 'Trained, caring teachers who know every child by name' },
  { icon: '🏡', text: 'Safe, clean, prepared classrooms designed for exploration' },
  { icon: '📚', text: '5 programs: Nursery, Montessori, KG, Saturday Coaching, Evening Academy' },
  { icon: '💬', text: 'Open parent communication via WhatsApp and walk-in visits' },
  { icon: '📍', text: 'Conveniently located on Kamalabad Road, Rawalpindi' },
];

export default function AdmissionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-falcon-sage text-white rounded-full text-sm font-bold shadow-md animate-pulse mb-6">
            <span aria-hidden>🎉</span>
            <span>Admissions Open 2026 — Limited Seats!</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Apply for Admission at Falcons Education System
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto mb-8">
            Give your child the best educational foundation in Rawalpindi. Our Montessori preschool,
            Saturday coaching, and evening academy are designed to help every child thrive.
          </p>
          <a
            href="#admissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-lg tap-target"
          >
            <span aria-hidden>📋</span>
            <span>Fill the Inquiry Form Below</span>
          </a>
        </div>
      </section>

      {/* Why Choose Us - quick persuasion */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-8 text-center">
            Why Parents Choose Falcons Education System
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reasons.map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 p-4 bg-falcon-cream rounded-xl border border-falcon-sand">
                <span className="text-2xl shrink-0" aria-hidden>{icon}</span>
                <p className="text-falcon-earth text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Programs - quick reference */}
      <section className="py-12 bg-falcon-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-6 text-center">
            Programs Available for Admission
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { name: 'Nursery', age: 'Age 2.5–3.5', icon: '🌱' },
              { name: 'Montessori Level', age: 'Age 3–6', icon: '📚' },
              { name: 'KG (Kindergarten)', age: 'Age 4–6', icon: '🎓' },
              { name: 'Saturday Coaching', age: 'School-going', icon: '📝' },
              { name: 'Evening Academy', age: 'School-going', icon: '🌙' },
            ].map(({ name, age, icon }) => (
              <div key={name} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-falcon-sand">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <div>
                  <p className="font-bold text-falcon-sageDark text-sm">{name}</p>
                  <p className="text-falcon-earth/70 text-xs">{age}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center">
            <Link href="/programs" className="text-falcon-sage font-semibold text-sm hover:text-falcon-sageDark transition-colors">
              View detailed program information →
            </Link>
          </p>
        </div>
      </section>

      {/* The Admission Form (reused component) */}
      <Admissions />

      {/* Testimonials for social proof */}
      <Testimonials />

      {/* Final CTA */}
      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            Don&apos;t Wait — Seats Are Filling Fast
          </h2>
          <p className="text-white/80 text-lg mb-8">
            The best investment you can make is in your child&apos;s education. Join the growing Falcons family today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#admissions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
            >
              <span aria-hidden>📋</span> Apply Now
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all tap-target"
            >
              <span aria-hidden>📞</span> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
