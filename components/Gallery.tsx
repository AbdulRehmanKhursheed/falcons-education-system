import Link from 'next/link';
import { ImageIcon, PlayCircle, ArrowUpRight } from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const plates = [
  { caption: 'Classroom · Practical life' },
  { caption: 'Materials · Sensorial work' },
  { caption: 'Reading corner · Mixed age' },
  { caption: 'Outdoor · Free movement' },
  { caption: 'Math materials · Bead chains' },
  { caption: 'Art · Self-led project' },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      className="relative bg-paper"
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Eyebrow number="05">The gallery</Eyebrow>
            <h2
              id="gallery-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Plates from{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                the school
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            Photography is being prepared. In the meantime, a few captioned plates
            describe what each room looks like in practice. The full gallery follows
            as soon as we publish it.
          </p>
        </FadeIn>

        {/* Plate grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plates.map((plate, i) => (
            <StaggerItem key={plate.caption}>
              <figure className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-paper-warm border border-line">
                  {/* Corner marks */}
                  <span aria-hidden className="absolute top-3 left-3 h-4 w-4 border-t border-l border-accent/60" />
                  <span aria-hidden className="absolute top-3 right-3 h-4 w-4 border-t border-r border-accent/60" />
                  <span aria-hidden className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-accent/60" />
                  <span aria-hidden className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-accent/60" />

                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center px-6">
                      <ImageIcon className="h-6 w-6 mx-auto text-ink-faint" strokeWidth={1.25} />
                      <p className="mt-4 font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                        Plate · {String(i + 1).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  {/* Grid overlay */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.06] transition-opacity"
                    style={{
                      backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px),
                                         linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
                      backgroundSize: '32px 32px',
                    }}
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between">
                  <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-ink-faint">
                    {plate.caption}
                  </p>
                  <p className="font-mono text-[10px] text-ink-faint">
                    {String(i + 1).padStart(2, '0')} / {String(plates.length).padStart(2, '0')}
                  </p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Video plate */}
        <FadeIn className="mt-16">
          <figure>
            <div className="relative aspect-video max-w-4xl mx-auto overflow-hidden bg-ink border border-line">
              <span aria-hidden className="absolute top-3 left-3 h-5 w-5 border-t border-l border-accent" />
              <span aria-hidden className="absolute top-3 right-3 h-5 w-5 border-t border-r border-accent" />
              <span aria-hidden className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-accent" />
              <span aria-hidden className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-accent" />

              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <PlayCircle className="h-10 w-10 mx-auto text-accent-soft" strokeWidth={1.25} />
                  <p className="mt-4 font-display text-2xl text-paper" style={{ fontVariationSettings: '"opsz" 24' }}>
                    School tour · forthcoming
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-paper/50 font-semibold">
                    A quiet walk through the rooms
                  </p>
                </div>
              </div>
            </div>
            <figcaption className="mt-4 max-w-4xl mx-auto flex items-baseline justify-between">
              <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-ink-faint">
                Video plate · school tour
              </p>
              <p className="font-mono text-[10px] text-ink-faint">Forthcoming</p>
            </figcaption>
          </figure>
        </FadeIn>

        {/* CTA */}
        <FadeIn className="mt-16 flex flex-col sm:flex-row items-baseline justify-between gap-6 border-t border-line pt-10">
          <p className="font-display text-2xl text-ink max-w-xl leading-[1.25]" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
            Rather see the rooms in person?
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-ink text-paper px-7 py-4 text-[14px] font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap"
          >
            Schedule a visit
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
