import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Gallery — Classroom Photos & Activities',
  description:
    'See inside Falcons Education System Rawalpindi — classroom photos, Montessori activities, and school events. A glimpse into how your child will learn and grow.',
  alternates: { canonical: `${SITE_CONFIG.url}/gallery` },
  openGraph: {
    title: 'Gallery — Falcons Education System Rawalpindi',
    description: 'Photos of classrooms, Montessori activities, and school life at Falcons Education System.',
    url: `${SITE_CONFIG.url}/gallery`,
  },
};

const categories = [
  { title: 'Classrooms', count: 3, icon: '🏫' },
  { title: 'Montessori Activities', count: 3, icon: '🧩' },
  { title: 'Outdoor & Play', count: 3, icon: '🏃' },
  { title: 'Events & Celebrations', count: 3, icon: '🎉' },
];

export default function GalleryPage() {
  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">Gallery</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Life at Falcons Education System
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            A glimpse into our classrooms, activities, and the joyful learning moments at our
            Montessori school on Kamalabad Road, Rawalpindi.
          </p>
        </div>
      </section>

      {/* Gallery Sections */}
      {categories.map(({ title, count, icon }) => (
        <section key={title} className="py-12 odd:bg-white even:bg-falcon-cream">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-8 flex items-center gap-3">
              <span aria-hidden>{icon}</span> {title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-falcon-sand/30 border-2 border-dashed border-falcon-sage/20 flex items-center justify-center"
                  aria-label={`${title} photo placeholder ${i + 1}`}
                >
                  <div className="text-center p-6">
                    <span className="text-4xl mb-2 block" aria-hidden>🖼️</span>
                    <p className="text-falcon-earth/50 text-sm">{title} — Photo {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Video Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-6 text-center">
            School Tour Video
          </h2>
          <div
            className="aspect-video rounded-2xl overflow-hidden bg-falcon-sand/30 border-2 border-dashed border-falcon-sage/20 flex items-center justify-center"
            aria-label="Video placeholder"
          >
            <div className="text-center p-8">
              <span className="text-6xl mb-4 block" aria-hidden>🎬</span>
              <p className="text-falcon-earth/70 font-medium">Add school tour video here</p>
              <p className="text-sm text-falcon-earth/50 mt-1">Campus walkthrough, classroom activities, or events</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            See It in Person
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Photos can only show so much. Visit our campus to experience the Falcons
            difference — no appointment needed during school hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
            >
              <span aria-hidden>📍</span> Visit Our Campus
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all tap-target"
            >
              <span aria-hidden>🎓</span> Apply Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
