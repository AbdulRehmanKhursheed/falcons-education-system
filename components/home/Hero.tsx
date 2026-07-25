'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { Parallax } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function Hero() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+enquire+about+admissions+at+Falcons+Education+System.`;

  return (
    <section className="relative -mt-16 overflow-hidden bg-paper pt-16 md:-mt-20 md:pt-20" aria-labelledby="hero-heading">
      {/* Signature: falcon flight line, draws itself on load */}
      <svg
        className="pointer-events-none absolute left-0 top-24 hidden h-[420px] w-full lg:block"
        viewBox="0 0 1440 420"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <motion.path
          d="M-60 380 C 240 330, 420 120, 760 150 S 1260 60, 1520 20"
          stroke="#1CA7E8"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeDasharray="1 12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: 'easeOut', delay: 0.4 }}
        />
      </svg>

      <div className="mx-auto max-w-6xl px-5 pb-14 pt-14 text-center md:px-8 md:pb-20 md:pt-24">
        <motion.p
          {...rise(0)}
          className="mx-auto inline-flex items-center gap-2 rounded-full bg-sun-soft px-4 py-1.5 text-sm font-extrabold text-ink"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-flame" />
          Admissions open · Session 2026
        </motion.p>

        <motion.h1
          {...rise(0.1)}
          id="hero-heading"
          className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[1.02] text-ink sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          Where curious minds{' '}
          <span className="relative inline-block text-brand">
            take flight
            <svg
              className="absolute -bottom-2 left-0 w-full md:-bottom-3"
              viewBox="0 0 300 14"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M4 10 C 80 2, 220 2, 296 8"
                stroke="#FFC53D"
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
              />
            </svg>
          </span>
          .
        </motion.h1>

        <motion.p
          {...rise(0.2)}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl"
        >
          A school in Rawalpindi for Nursery to Class 6 — with Montessori early years, evening
          &amp; Saturday coaching, and computer courses for growing kids.
        </motion.p>

        <motion.div {...rise(0.3)} className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-float"
          >
            Chat on WhatsApp
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-white px-7 py-3.5 text-base font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-brand-tint hover:text-brand-dark"
          >
            Explore programs
          </Link>
        </motion.div>

        <motion.p {...rise(0.38)} className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-faint">
          <MapPin size={15} className="text-brand" />
          Kamalabad Road, Rawalpindi · {SITE_CONFIG.phone}
        </motion.p>
      </div>

      {/* Cinematic hero image */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.45 }}
        className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24"
      >
        <Parallax distance={26} className="overflow-hidden rounded-3xl shadow-rise">
          <Photo
            alt="Falcons Education System classroom — children working in warm morning light"
            label="Campus photo — coming soon"
            tone="sky"
            priority
            className="aspect-[16/10] w-full sm:aspect-[21/10]"
          />
        </Parallax>
      </motion.div>
    </section>
  );
}
