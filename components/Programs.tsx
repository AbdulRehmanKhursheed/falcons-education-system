import Link from 'next/link';
import {
  Sprout,
  BookOpenText,
  GraduationCap,
  PencilLine,
  FlaskConical,
  Trophy,
  Moon,
  CalendarDays,
  Laptop,
  ArrowUpRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

type Program = {
  id: string;
  title: string;
  age?: string;
  badge?: string;
  schedule?: string;
  description: string;
  features: string[];
  Icon: LucideIcon;
};

const earlyYearsPrograms: Program[] = [
  {
    id: 'nursery',
    title: 'Nursery',
    age: '2.5 – 3.5 years',
    description:
      'A first introduction to the Montessori environment. Practical life skills, sensorial exploration, and language emerge in a warm, unhurried setting.',
    features: ['Practical life', 'Sensorial materials', 'Language introduction', 'Social-emotional development'],
    Icon: Sprout,
  },
  {
    id: 'montessori',
    title: 'Montessori Level',
    age: '3 – 6 years',
    description:
      'The full curriculum with prepared environments and self-directed learning. Practical life, sensorial, language, mathematics, and cultural studies.',
    features: ['Full Montessori materials', 'Math & language work', 'Cultural studies', 'Child-led learning'],
    Icon: BookOpenText,
  },
  {
    id: 'kg',
    title: 'Kindergarten',
    age: '4 – 6 years',
    description:
      'A bridge between Montessori and formal schooling. Reinforces foundations while introducing structured activities that prepare children for primary.',
    features: ['Reading & writing', 'Number concepts', 'Science exploration', 'School readiness'],
    Icon: GraduationCap,
  },
];

const primaryClasses: Program[] = [
  {
    id: 'class-1-2',
    title: 'Class 1 & 2',
    age: '5 – 7 years',
    description:
      'Foundations in English, Urdu, Mathematics, and General Knowledge. Reading, writing, and numeracy develop through structured, engaging lessons.',
    features: ['English reading & writing', 'Urdu & Islamic Studies', 'Basic Mathematics', 'GK & Science basics'],
    Icon: PencilLine,
  },
  {
    id: 'class-3-4',
    title: 'Class 3 & 4',
    age: '7 – 9 years',
    description:
      'Expanding knowledge in core subjects with a focus on critical thinking and problem-solving. Students develop confidence across the curriculum.',
    features: ['Comprehension & composition', 'Math (fractions, geometry)', 'Science & Social Studies', 'Urdu & Islamic Studies'],
    Icon: FlaskConical,
  },
  {
    id: 'class-5-6',
    title: 'Class 5 & 6',
    age: '9 – 12 years',
    description:
      'Preparation for secondary education with an emphasis on analytical thinking, exam practice, and academic excellence across all subjects.',
    features: ['Advanced English & Urdu', 'Mathematics & Science', 'Social Studies & Computer', 'Exam preparation & tests'],
    Icon: Trophy,
  },
];

const coachingPrograms: Program[] = [
  {
    id: 'evening-academy',
    title: 'Evening Coaching Academy',
    badge: 'New · 2026',
    schedule: 'Mon – Fri · 15:30 – 19:30',
    description:
      'After-school coaching for children attending other schools. Builds understanding, supervises homework, and strengthens core concepts.',
    features: [
      'Concept-strengthening across subjects',
      'Exam preparation and practice tests',
      'Supervised homework completion',
      'Confidence-building',
    ],
    Icon: Moon,
  },
  {
    id: 'saturday-coaching',
    title: 'Saturday Coaching',
    badge: 'New · 2026',
    schedule: 'Saturday · 09:00 – 13:00',
    description:
      'Weekend coaching for school-going children — core subject support, exam prep, and guided study sessions in a small-group setting.',
    features: [
      'Core subjects · English, Math, Science, Urdu',
      'Exam preparation and practice',
      'Guided homework completion',
      'Small group, individual attention',
    ],
    Icon: CalendarDays,
  },
  {
    id: 'computer-courses',
    title: 'Computer Courses for Kids',
    badge: 'New · 2026',
    schedule: 'Flexible · enquire for details',
    description:
      'A real introduction to digital literacy — the foundational skills children need before they need them.',
    features: [
      'Basic computer knowledge',
      'Touch typing',
      'Microsoft Word basics',
      'Internet fundamentals',
    ],
    Icon: Laptop,
  },
];

function ProgramCard({ program, dense = false }: { program: Program; dense?: boolean }) {
  const { id, title, age, badge, schedule, description, features, Icon } = program;
  return (
    <article
      id={id}
      className={`group relative bg-paper hover:bg-paper-warm transition-colors duration-300 ${dense ? 'p-7 lg:p-8' : 'p-8 lg:p-10'}`}
    >
      <div className="flex items-start justify-between mb-8">
        <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
        {badge && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand bg-brand-soft px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <h4 className="font-display text-2xl lg:text-[1.6rem] text-ink leading-tight" style={{ fontVariationSettings: '"opsz" 24' }}>
        {title}
      </h4>

      {age && (
        <p className="mt-2 text-[12px] uppercase tracking-[0.16em] font-semibold text-ink-faint">
          {age}
        </p>
      )}
      {schedule && (
        <p className="mt-2 font-mono text-[11px] tracking-tight text-ink-muted">
          {schedule}
        </p>
      )}

      <p className="mt-5 text-[14.5px] text-ink-soft leading-[1.65]">
        {description}
      </p>

      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-soft">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Programs() {
  return (
    <section
      id="programs"
      className="bg-paper"
      aria-labelledby="programs-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        {/* ── Section intro ──────────────────────────────────────────── */}
        <FadeIn className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-20">
          <div className="lg:col-span-7">
            <Eyebrow number="04">Programs</Eyebrow>
            <h2
              id="programs-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              School and coaching, under{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                one roof
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-[1.05rem] text-ink-soft leading-[1.65] max-w-md">
            Three families of programs: Montessori early years for the youngest,
            primary classes through age 12, and after-school coaching for children
            attending other schools.
          </p>
        </FadeIn>

        {/* ── Early Years ───────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-line">
            <h3 className="font-display text-2xl sm:text-3xl text-ink" style={{ fontVariationSettings: '"opsz" 48' }}>
              Early Years &amp; Montessori
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              Ages 2.5 – 6
            </p>
          </div>

          <Stagger className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {earlyYearsPrograms.map((p) => (
              <StaggerItem key={p.id} className="bg-paper">
                <ProgramCard program={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* ── Primary ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-line">
            <h3 className="font-display text-2xl sm:text-3xl text-ink" style={{ fontVariationSettings: '"opsz" 48' }}>
              Primary School
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              Class 1 – 6 · National syllabus
            </p>
          </div>

          <Stagger className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {primaryClasses.map((p) => (
              <StaggerItem key={p.id} className="bg-paper">
                <ProgramCard program={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* ── Coaching ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-line">
            <h3 className="font-display text-2xl sm:text-3xl text-ink" style={{ fontVariationSettings: '"opsz" 48' }}>
              Evening &amp; Saturday Coaching
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              For students at other schools
            </p>
          </div>

          <Stagger className="grid md:grid-cols-3 gap-px bg-line border border-line">
            {coachingPrograms.map((p) => (
              <StaggerItem key={p.id} className="bg-paper">
                <ProgramCard program={p} dense />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        <FadeIn>
          <div className="relative mt-24 border-t border-line pt-12">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-7">
                <Eyebrow number="05">Admissions</Eyebrow>
                <h3 className="mt-5 font-display text-3xl sm:text-4xl text-ink leading-[1.1]" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
                  Limited seats for the{' '}
                  <span className="italic text-brand">2026</span>{' '}
                  session.
                </h3>
              </div>
              <div className="lg:col-span-5 lg:text-right flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Link
                  href="/admissions"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[15px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                >
                  Apply for admission
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-7 py-4 text-[15px] font-semibold text-ink hover:border-ink transition-colors"
                >
                  View program details
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
