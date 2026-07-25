import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

const SLOTS = [
  { src: '/images/gallery-1.jpg', alt: 'Children playing cricket in the school courtyard', tone: 'sky' as const },
  { src: '/images/gallery-2.jpg', alt: 'Art class — small hands painting bright posters', tone: 'sun' as const },
  { src: '/images/gallery-3.jpg', alt: 'A child lost in a book in the reading corner', tone: 'sky' as const },
  { src: '/images/gallery-4.jpg', alt: 'Two children sharing a keyboard in the computer lab', tone: 'navy' as const },
  { src: '/images/gallery-5.jpg', alt: 'Sports day — children racing toward a yellow ribbon', tone: 'sun' as const },
  { src: '/images/gallery-6.jpg', alt: 'Montessori materials neatly arranged on low wooden shelves', tone: 'sky' as const },
];

export function GalleryMarquee() {
  const strip = [...SLOTS, ...SLOTS]; // duplicated for seamless loop
  return (
    <section className="overflow-hidden bg-paper py-20 md:py-28" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="gallery-heading" className="text-4xl font-extrabold text-ink sm:text-5xl">
            A day at <span className="text-brand">Falcons Education System</span>
          </h2>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 font-bold text-brand hover:text-brand-dark"
          >
            See the gallery
            <ArrowRight size={17} />
          </Link>
        </FadeIn>
      </div>

      <FadeIn className="mt-12">
        <div className="flex w-max animate-marquee gap-5 pr-5 hover:[animation-play-state:paused]">
          {strip.map((s, i) => (
            <Photo
              key={i}
              src={s.src}
              alt={s.alt}
              tone={s.tone}
              sizes="384px"
              className="h-56 w-80 shrink-0 rounded-2xl shadow-paper md:h-64 md:w-96"
            />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
