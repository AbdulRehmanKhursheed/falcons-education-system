import type { Metadata } from 'next';
import { ArrowRight, Clock } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';

export const metadata: Metadata = {
  title: 'Programs & Courses — School Play Group to Class 6, Coaching up to Matric',
  description:
    'Explore all programs at Falcons Education System Rawalpindi: school from Play Group to Class 6, Evening Coaching Academy (Play Group to Matric), Spoken English, and Computer Courses. Admissions open 2026.',
  alternates: { canonical: `${SITE_CONFIG.url}/programs` },
  openGraph: {
    title: 'Programs & Courses — Falcons Education System Rawalpindi',
    description:
      'School Play Group to Class 6, Evening Coaching up to Matric, Spoken English, Computer Courses — Kamalabad Road, Rawalpindi. Admissions open.',
    url: `${SITE_CONFIG.url}/programs`,
  },
};

type Chapter = {
  id: string;
  kicker: string;
  kickerClass: string;
  title: string;
  overview: string;
  details: string[];
  schedule: string;
  tone: 'sky' | 'sun' | 'navy';
  src?: string;
  imageAlt: string;
};

const CHAPTER_IMAGES: Record<string, string> = {
  nursery: '/images/nursery.jpg',
  montessori: '/images/montessori-level-1.jpg',
  kg: '/images/kindergarten.jpg',
  'class-1-2': '/images/class-1-2.jpg',
  'class-3-4': '/images/class-3-4.jpg',
  'class-5-6': '/images/class-5-6.jpg',
  'evening-academy': '/images/evening-academy.jpg',
  'saturday-coaching': '/images/saturday-coaching.jpg',
};

const CHAPTERS: Chapter[] = [
  {
    id: 'nursery',
    kicker: 'The first step · from age 3',
    kickerClass: 'text-brand',
    title: 'Play Group & Nursery',
    overview:
      'A gentle first step. Little ones learn to pour, button, share and speak up — real skills, built through play in a calm Montessori room.',
    details: [
      'Practical life: pouring, spooning, self-care',
      'Sensorial exploration with Montessori materials',
      'Language through stories, songs and conversation',
      'Sharing, turn-taking and empathy',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 12:00 PM (Fri till 12:30)',
    tone: 'sky',
    imageAlt: 'Nursery children doing practical life activities',
  },
  {
    id: 'montessori',
    kicker: 'Ages 3 – 6',
    kickerClass: 'text-brand',
    title: 'Montessori Level',
    overview:
      'The full Montessori curriculum — children choose real materials and teach their own hands: golden beads for math, sandpaper letters for words.',
    details: [
      'All five Montessori learning areas',
      'Math: number rods, golden beads, operations',
      'Language: movable alphabet, early reading & writing',
      'Culture: geography, science, botany',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 2:00 PM (Fri till 12:30)',
    tone: 'sun',
    imageAlt: 'Montessori classroom with children using golden bead materials',
  },
  {
    id: 'kg',
    kicker: 'Ages 4 – 6',
    kickerClass: 'text-flame',
    title: 'Kindergarten',
    overview:
      'The bridge to formal school. Montessori confidence meets structure — reading fluently, writing sentences, working with numbers.',
    details: [
      'Reading fluency and comprehension',
      'Handwriting and creative writing',
      'Addition, subtraction, problem-solving',
      'School readiness: instructions, groups, time',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 2:00 PM (Fri till 12:30)',
    tone: 'sky',
    imageAlt: 'Kindergarten students reading together',
  },
  {
    id: 'class-1-2',
    kicker: 'Class 1 & 2 · Ages 5 – 7',
    kickerClass: 'text-brand',
    title: 'Foundations',
    overview:
      'English, Urdu, Math, Islamic Studies and Science — taught in small classes where the teacher knows exactly where each child stands.',
    details: [
      'English phonics, reading and writing',
      'Urdu reading and comprehension',
      'Core math concepts',
      'Science through simple experiments',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 2:00 PM (Fri till 12:30)',
    tone: 'sun',
    imageAlt: 'Class 1 students writing at their desks',
  },
  {
    id: 'class-3-4',
    kicker: 'Class 3 & 4 · Ages 7 – 9',
    kickerClass: 'text-brand',
    title: 'Growing minds',
    overview:
      'The thinking years. Fractions and geometry, composition and grammar, Pakistan and the world — with problem-solving at the centre.',
    details: [
      'English comprehension and composition',
      'Math: fractions, geometry, word problems',
      'Science: plants, animals, materials',
      'Social studies: Pakistan and world geography',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 2:00 PM (Fri till 12:30)',
    tone: 'navy',
    imageAlt: 'Class 3 students doing a science experiment',
  },
  {
    id: 'class-5-6',
    kicker: 'Class 5 & 6 · Ages 9 – 12',
    kickerClass: 'text-flame',
    title: 'Ready for what’s next',
    overview:
      'Secondary school preparation, done properly — algebra, the sciences, computer studies, and the exam habits that carry students forward.',
    details: [
      'Advanced English and Urdu',
      'Algebra, geometry, data handling',
      'Physics, chemistry, biology fundamentals',
      'Computer studies and exam practice',
    ],
    schedule: 'Mon – Sat · 8:00 AM – 2:00 PM (Fri till 12:30)',
    tone: 'sky',
    imageAlt: 'Class 6 students working in the computer lab',
  },
  {
    id: 'evening-academy',
    kicker: 'Evening · Play Group to Matric · any school',
    kickerClass: 'text-brand-dark',
    title: 'Evening Coaching Academy',
    overview:
      'After school, before dinner — subject coaching, exam preparation and supervised homework for children from any school, Play Group up to Matric. Updates live on the Coaching Academy page.',
    details: [
      'Subject coaching, arranged by level',
      'Exam preparation and practice tests',
      'Supervised homework completion',
      'Small groups, individual attention',
    ],
    schedule: 'Mon – Sat · 3:30 – 7:00 PM',
    tone: 'navy',
    imageAlt: 'Evening academy students getting homework help',
  },
  {
    id: 'saturday-coaching',
    kicker: 'Within academy hours · school-going children',
    kickerClass: 'text-brand-dark',
    title: 'Spoken English & Computer Courses',
    overview:
      'Confidence with words and with keyboards — speaking practice that starts with conversation, and computer classes that start with real hands-on use.',
    details: [
      'Spoken English: conversation and confidence',
      'Basic computer knowledge and typing',
      'MS Word and internet fundamentals',
      'Small groups, individual attention',
    ],
    schedule: 'Within evening academy hours · Mon – Sat',
    tone: 'sun',
    imageAlt: 'Students in a spoken English and computer class',
  },
];

export default function ProgramsPage() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+ask+about+programs+at+Falcons+Education+System.`;

  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Every age. <span className="text-brand">Every pace.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              From a three-year-old&apos;s first morning to a matric student&apos;s board exams
              — school and coaching under one roof on Kamalabad Road.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-20" aria-label="All programs">
        <div className="mx-auto flex max-w-6xl flex-col gap-20 px-5 md:gap-28 md:px-8">
          {CHAPTERS.map((c, i) => (
            <FadeIn key={c.id}>
              <article
                id={c.id}
                className={`grid scroll-mt-28 items-center gap-8 md:grid-cols-2 md:gap-14 ${
                  i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Photo
                  src={CHAPTER_IMAGES[c.id]}
                  alt={c.imageAlt}
                  label={CHAPTER_IMAGES[c.id] ? undefined : 'Photo coming soon'}
                  tone={c.tone}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[4/3] w-full rounded-3xl shadow-card"
                />
                <div>
                  <p className={`text-sm font-extrabold ${c.kickerClass}`}>{c.kicker}</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-ink md:text-4xl">{c.title}</h2>
                  <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
                    {c.overview}
                  </p>
                  <Stagger className="mt-5 flex flex-col gap-2" gap={0.05}>
                    {c.details.map((d) => (
                      <StaggerItem key={d} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {d}
                      </StaggerItem>
                    ))}
                  </Stagger>
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper-warm px-4 py-2 text-sm font-bold text-ink-soft">
                    <Clock size={15} className="text-brand" />
                    {c.schedule}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Not sure which program fits?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                Tell us your child&apos;s age and school history — we&apos;ll suggest the right
                starting point.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Ask on WhatsApp
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
