import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

const SLOTS = [
  { alt: 'Children playing in the school courtyard', tone: 'sky' as const },
  { alt: 'Art class — small hands painting', tone: 'sun' as const },
  { alt: 'Reading corner with picture books', tone: 'sky' as const },
  { alt: 'Computer lab session', tone: 'navy' as const },
  { alt: 'Sports day on the school ground', tone: 'sun' as const },
  { alt: 'Montessori materials on low shelves', tone: 'sky' as const },
];

export function GalleryMarquee() {
  const strip = [...SLOTS, ...SLOTS]; // duplicated for seamless loop
  return (
    <section className="overflow-hidden bg-paper py-20 md:py-28" aria-labelledby="gallery-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="gallery-heading" className="text-4xl font-extrabold text-ink sm:text-5xl">
            A day at <span className="text-brand">Falcons</span>
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
              alt={s.alt}
              label="Photo coming soon"
              tone={s.tone}
              sizes="320px"
              className="h-56 w-80 shrink-0 rounded-2xl shadow-paper md:h-64 md:w-96"
            />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
