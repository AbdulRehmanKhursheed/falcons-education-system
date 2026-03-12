import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const highlights = [
  { icon: '🌱', text: 'Montessori Method' },
  { icon: '👩‍🏫', text: 'Trained, Caring Teachers' },
  { icon: '🏫', text: 'Safe, Prepared Environment' },
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
      <div className="absolute inset-0 bg-gradient-to-br from-white via-falcon-cream to-falcon-warm" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-falcon-sky/60 via-transparent to-transparent" />

      {/* Decorative blobs */}
      <div className="absolute top-16 right-8 w-40 h-40 rounded-full bg-falcon-sage/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-24 left-8 w-48 h-48 rounded-full bg-falcon-sky/30 blur-3xl" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {/* Admissions banner */}
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

          <p className="text-falcon-earth/80 max-w-2xl mx-auto mb-3 text-base sm:text-lg">
            A Montessori preschool dedicated to child-centered learning. Enroll your child in
            Nursery, Montessori Level, or KG and give them the foundation for a lifetime of discovery.
          </p>

          <p className="text-sm text-falcon-earth/60 mb-10">
            <Link
              href="#contact"
              className="hover:text-falcon-sage transition-colors underline underline-offset-2"
            >
              📍 {SITE_CONFIG.address.full}
            </Link>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
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
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg border-2 border-falcon-sage/40 hover:border-falcon-sage hover:bg-falcon-cream transition-all tap-target"
            >
              <span>Apply for Admission</span>
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-3 justify-center mb-14">
            {highlights.map(({ icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-falcon-sand rounded-full text-sm font-medium text-falcon-earth shadow-sm"
              >
                <span aria-hidden>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-falcon-sand rounded-full text-sm font-semibold text-falcon-earth hover:border-falcon-sage hover:text-falcon-sage transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>
            <a
              href={SITE_CONFIG.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-falcon-sand rounded-full text-sm font-semibold text-falcon-earth hover:border-falcon-sage hover:text-falcon-sage transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            <a
              href={SITE_CONFIG.mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-falcon-sand rounded-full text-sm font-semibold text-falcon-earth hover:border-falcon-sage hover:text-falcon-sage transition-colors shadow-sm"
            >
              <span aria-hidden>🗺️</span>
              Google Maps
            </a>
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div
            className="relative aspect-video rounded-3xl overflow-hidden bg-falcon-cream border-2 border-dashed border-falcon-sand flex items-center justify-center shadow-lg"
            aria-label="Hero image — add school photo or video"
          >
            <div className="text-center p-8">
              <span className="text-7xl mb-4 block" aria-hidden>🖼️</span>
              <p className="text-falcon-earth/70 font-semibold text-lg">Add hero photo or video here</p>
              <p className="text-sm text-falcon-earth/50 mt-2">
                Recommended: 16:9 — classroom, school building, or children learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
