'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';

const QUOTES = [
  {
    name: 'Uzma S.',
    role: 'Montessori student ki walida',
    quote:
      'MashaAllah teachers bohat mehnat karti hain. Bachi ab ghar aa kar khud parhne baithti hai.',
  },
  {
    name: 'Kashif M.',
    role: 'Class 1 ke student ke walid',
    quote:
      'Pehle school ke naam se rota tha, ab subah khud uniform pehen ke tayyar hota hai.',
  },
  {
    name: 'Ahmad R.',
    role: 'Father of a KG student',
    quote: 'Staff cooperative hai, safai achi hai, aur fees bhi reasonable. Recommended.',
  },
];

const AUTO_ADVANCE_MS = 5000;

export function Quote() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const q = QUOTES[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + QUOTES.length) % QUOTES.length);

  // continuous rotation — pauses while the reader hovers, resets after manual nav
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => go(1), AUTO_ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, index]);

  return (
    <section
      className="bg-paper-warm py-20 md:py-28"
      aria-labelledby="parents-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <FadeIn>
          <h2 id="parents-heading" className="text-sm font-extrabold uppercase tracking-wide text-brand">
            From parents
          </h2>
        </FadeIn>

        <FadeIn className="relative mt-8 min-h-[220px] md:min-h-[190px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <blockquote className="font-display text-2xl font-bold leading-snug text-ink sm:text-3xl md:text-[2.15rem]">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-6 font-semibold text-ink-muted">
                {q.name} · <span className="text-ink-faint">{q.role}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </FadeIn>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous quote"
            className="tap-target rounded-full border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2" aria-hidden="true">
            {QUOTES.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-brand' : 'w-2 bg-ink-faint/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next quote"
            className="tap-target rounded-full border border-line bg-white text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
