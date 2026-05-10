import Link from 'next/link';
import { Quote, ArrowUpRight, Star } from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const testimonials = [
  {
    name: 'Sara K.',
    role: 'Mother of a Nursery student',
    quote:
      'My daughter looks forward to school every single day. The teachers are patient and present. The Montessori approach has built real confidence in her — not the performative kind.',
  },
  {
    name: 'Ahmad R.',
    role: 'Father of a KG student',
    quote:
      'The environment is clean, the staff genuinely care, and they take the time to know each child. We came in for a tour and stayed for admission. Glad we did.',
  },
  {
    name: 'Nadia M.',
    role: 'Mother of a Montessori Level student',
    quote:
      'Our son made real progress in reading and math through the Montessori materials. The teachers treat children as capable, and the children respond to that.',
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative bg-ink text-paper"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        {/* Section intro — dark variant */}
        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <Eyebrow number="06" className="text-accent-soft">From parents</Eyebrow>
            <h2
              id="testimonials-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-paper"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Three families,{' '}
              <span className="italic text-accent-soft" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                in their own words
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-paper/70 text-[1.05rem] leading-[1.65]">
            Quiet testimony rather than polished marketing. Real parents, real
            children, real changes — observed over time.
          </p>
        </FadeIn>

        {/* Quote cards */}
        <Stagger className="grid md:grid-cols-3 gap-px bg-paper/15">
          {testimonials.map(({ name, role, quote }, i) => (
            <StaggerItem key={name} className="bg-ink hover:bg-ink-soft transition-colors duration-300">
              <figure className="p-8 lg:p-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <Quote className="h-7 w-7 text-accent" strokeWidth={1.25} />
                  <div className="flex items-center gap-0.5" aria-label="Five out of five">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
                    ))}
                  </div>
                </div>

                <blockquote className="font-display text-[1.35rem] leading-[1.45] text-paper" style={{ fontVariationSettings: '"opsz" 24' }}>
                  <span aria-hidden className="text-accent-soft">&ldquo;</span>
                  {quote}
                  <span aria-hidden className="text-accent-soft">&rdquo;</span>
                </blockquote>

                <figcaption className="mt-auto pt-8">
                  <div className="border-t border-paper/15 pt-5 flex items-baseline justify-between">
                    <div>
                      <p className="font-display text-base text-paper" style={{ fontVariationSettings: '"opsz" 18' }}>
                        {name}
                      </p>
                      <p className="text-xs text-paper/55 mt-1">{role}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/35">
                      {String(i + 1).padStart(2, '0')} / 03
                    </span>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Inline CTA */}
        <FadeIn className="mt-16 border-t border-paper/15 pt-12 flex flex-col sm:flex-row items-baseline justify-between gap-6">
          <p className="font-display text-2xl sm:text-3xl text-paper max-w-xl leading-tight" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
            We&apos;d rather you visit the school than read more reviews.
          </p>
          <Link
            href="/admissions"
            className="group inline-flex items-center gap-2 rounded-full bg-paper text-ink px-7 py-4 text-[15px] font-semibold hover:bg-accent-soft transition-colors whitespace-nowrap"
          >
            Schedule a visit
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
