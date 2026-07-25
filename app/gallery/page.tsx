import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

export const metadata: Metadata = {
  title: 'Gallery — Classroom Photos & Activities',
  description:
    'See inside Falcons Education System Rawalpindi — classroom photos, Montessori activities, and school events. A glimpse into how your child will learn and grow.',
  alternates: { canonical: `${SITE_CONFIG.url}/gallery` },
  openGraph: {
    title: 'Gallery — Falcons Education System Rawalpindi',
    description:
      'Photos of classrooms, Montessori activities, and school life at Falcons Education System.',
    url: `${SITE_CONFIG.url}/gallery`,
  },
};

const SECTIONS: Array<{
  title: string;
  slots: Array<{ src: string; alt: string }>;
}> = [
  {
    title: 'Classrooms',
    slots: [
      { src: '/images/primary.jpg', alt: 'Primary classroom — students raising hands during a lesson' },
      { src: '/images/kindergarten.jpg', alt: 'Kindergarten children reading a picture book together' },
      { src: '/images/class-1-2.jpg', alt: 'A Class 1 student practising writing' },
    ],
  },
  {
    title: 'Montessori activities',
    slots: [
      { src: '/images/montessori.jpg', alt: 'Golden bead work with a teacher guiding small hands' },
      { src: '/images/nursery.jpg', alt: 'Practical life — a nursery child pouring water between jugs' },
      { src: '/images/gallery-6.jpg', alt: 'Montessori materials arranged on low wooden shelves' },
    ],
  },
  {
    title: 'Learning & creativity',
    slots: [
      { src: '/images/gallery-2.jpg', alt: 'Art class — bright posters and painted hands' },
      { src: '/images/gallery-3.jpg', alt: 'The reading corner — a child lost in a story' },
      { src: '/images/gallery-4.jpg', alt: 'Computer lab — two children sharing a keyboard' },
    ],
  },
  {
    title: 'Outdoor & school life',
    slots: [
      { src: '/images/gallery-1.jpg', alt: 'Cricket with a soft ball in the school courtyard' },
      { src: '/images/gallery-5.jpg', alt: 'Sports day — racing to the yellow ribbon finish line' },
      { src: '/images/class-5-6.jpg', alt: 'A senior student presenting confidently to the class' },
    ],
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Life at <span className="text-brand">Falcons</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Classrooms, courtyard, small hands at work — a walk through the school in
              pictures.
            </p>
          </FadeIn>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title} className="bg-paper py-10 md:py-14" aria-label={section.title}>
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <FadeIn>
              <h2 className="text-2xl font-extrabold text-ink md:text-3xl">{section.title}</h2>
            </FadeIn>
            <Stagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
              {section.slots.map((slot, i) => (
                <StaggerItem key={i}>
                  <Photo
                    src={slot.src}
                    alt={slot.alt}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/3] w-full rounded-2xl shadow-paper"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ))}

      <section className="bg-paper py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Photos only show so much
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                Walk through the school on a working morning — the atmosphere is the real
                gallery.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  Plan a visit
                </Link>
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
                >
                  Apply now
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
