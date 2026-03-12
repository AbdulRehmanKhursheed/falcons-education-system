import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const highlights = [
  { icon: '🌱', text: 'Montessori Method' },
  { icon: '👩‍🏫', text: 'Qualified Teachers' },
  { icon: '🏫', text: 'Safe Environment' },
  { icon: '📚', text: 'Holistic Curriculum' },
];

export function Hero() {
  const ctaHref = SITE_CONFIG.whatsapp || (SITE_CONFIG.phone ? `tel:${SITE_CONFIG.phone}` : '#admissions');
  const ctaTarget = SITE_CONFIG.whatsapp ? '_blank' : undefined;
  const ctaRel = SITE_CONFIG.whatsapp ? 'noopener noreferrer' : undefined;

  return (
    <section
      className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-falcon-cream via-falcon-warm to-falcon-sageLight/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-falcon-sky/30 via-transparent to-transparent" />

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-falcon-sage/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-32 left-10 w-40 h-40 rounded-full bg-falcon-sky/20 blur-3xl" aria-hidden />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-falcon-warm/50 blur-2xl" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Admissions Banner */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-falcon-sage text-white rounded-full text-sm font-bold shadow-md animate-pulse">
            <span aria-hidden>🎉</span>
            <span>Admissions Open 2025 — Limited Seats Available!</span>
          </div>
        </div>

        <div className="text-center">
          <h1
            id="hero-heading"
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-falcon-sageDark leading-tight mb-4 animate-fade-in"
          >
            {SITE_CONFIG.name}
          </h1>

          <p className="text-xl sm:text-2xl text-falcon-earth font-semibold mb-3">
            {SITE_CONFIG.tagline}
          </p>

          <p className="text-falcon-earth/80 max-w-2xl mx-auto mb-4 text-base sm:text-lg">
            The best Montessori preschool in Rawalpindi — Kamalabad Road. Enroll your child in
            Nursery, Montessori Level, or KG today and give them the gift of child-centered learning.
          </p>

          <p className="text-sm text-falcon-earth/60 mb-10">
            📍 Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-lg hover:shadow-xl tap-target"
            >
              <span aria-hidden>📞</span>
              <span>Schedule a Free Visit</span>
            </a>
            <Link
              href="#admissions"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/80 text-falcon-sageDark rounded-2xl font-bold text-lg border-2 border-falcon-sage/30 hover:border-falcon-sage hover:bg-white transition-all tap-target"
            >
              <span>Apply for Admission</span>
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Highlights pills */}
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            {highlights.map(({ icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-falcon-sage/20 rounded-full text-sm font-medium text-falcon-earth shadow-sm"
              >
                <span aria-hidden>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative aspect-video rounded-3xl overflow-hidden bg-white/50 border-2 border-dashed border-falcon-sage/40 flex items-center justify-center shadow-lg"
            aria-label="Hero image placeholder — add classroom or school photo/video"
          >
            <div className="text-center p-8">
              <span className="text-7xl mb-4 block" aria-hidden>🖼️</span>
              <p className="text-falcon-earth/70 font-semibold text-lg">Add hero photo or video here</p>
              <p className="text-sm text-falcon-earth/50 mt-2">Recommended: 16:9 ratio — classroom activities, building exterior, or children learning</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
