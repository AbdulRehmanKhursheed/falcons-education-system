import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Programs & Courses — Montessori, Coaching & Evening Academy',
  description:
    'Explore all programs at Falcons Education System Rawalpindi: Montessori Nursery, KG, Saturday Coaching, and Evening Academy. Ages 2.5+. Admissions open 2026.',
  alternates: { canonical: `${SITE_CONFIG.url}/programs` },
  openGraph: {
    title: 'Programs & Courses — Falcons Education System Rawalpindi',
    description:
      'Montessori Nursery, KG, Saturday Coaching, Evening Academy — Kamalabad Road, Rawalpindi. Admissions open.',
    url: `${SITE_CONFIG.url}/programs`,
  },
};

const montessoriPrograms = [
  {
    id: 'nursery',
    title: 'Nursery Program',
    age: '2.5 – 3.5 years',
    icon: '🌱',
    overview: 'A gentle introduction to the Montessori environment for the youngest learners.',
    details: [
      'Practical life activities: pouring, spooning, buttoning, and self-care',
      'Sensorial exploration with Montessori materials',
      'Language development through stories, songs, and conversation',
      'Social-emotional skills: sharing, turn-taking, and empathy',
      'Fine and gross motor development through movement and outdoor play',
    ],
    schedule: 'Monday – Friday, 8:00 AM – 12:00 PM',
  },
  {
    id: 'montessori',
    title: 'Montessori Level',
    age: '3 – 6 years',
    icon: '📚',
    overview: 'The full Montessori curriculum with prepared environments and self-directed learning.',
    details: [
      'Complete Montessori materials for all five areas of learning',
      'Mathematics: number rods, spindle boxes, golden beads, operations',
      'Language: sandpaper letters, movable alphabet, reading, writing',
      'Cultural studies: geography, science, botany, history',
      'Practical life and sensorial refinement at advanced levels',
    ],
    schedule: 'Monday – Friday, 8:00 AM – 2:00 PM',
  },
  {
    id: 'kg',
    title: 'KG (Kindergarten)',
    age: '4 – 6 years',
    icon: '🎓',
    overview: 'Bridges Montessori foundations to formal schooling and early academics.',
    details: [
      'Reading fluency and comprehension',
      'Writing: sentence construction, creative writing, handwriting',
      'Number concepts, addition, subtraction, problem-solving',
      'Basic science and environmental awareness',
      'School readiness: following instructions, time management, group work',
    ],
    schedule: 'Monday – Friday, 8:00 AM – 2:00 PM',
  },
];

const additionalPrograms = [
  {
    id: 'saturday-coaching',
    title: 'Saturday Coaching',
    target: 'School-going children',
    icon: '📝',
    badge: 'NEW',
    overview: 'Weekend coaching and tutoring for children who need extra academic support.',
    details: [
      'Core subject tutoring: English, Math, Science, Urdu',
      'Exam preparation and practice tests',
      'Guided homework completion',
      'Reading and writing improvement',
      'Small group sizes for individual attention',
    ],
    schedule: 'Every Saturday, 9:00 AM – 1:00 PM',
  },
  {
    id: 'evening-academy',
    title: 'Evening Academy',
    target: 'School-going children',
    icon: '🌙',
    badge: 'NEW',
    overview: 'After-school evening program for homework help, academic support, and skill building.',
    details: [
      'Supervised homework completion',
      'Subject reinforcement and extra practice',
      'Daily reading and writing sessions',
      'Creative activities: art, craft, and projects',
      'Safe, supervised environment until parent pickup',
    ],
    schedule: 'Monday – Friday, afternoon/evening sessions',
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">Our Programs</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Programs & Courses for Every Child
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            From Montessori early learning to weekend coaching and evening classes — we offer complete
            educational support for children in Rawalpindi.
          </p>
        </div>
      </section>

      {/* Montessori Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-falcon-sageDark mb-4 text-center">
            Montessori Early Learning
          </h2>
          <p className="text-falcon-earth text-center max-w-2xl mx-auto mb-12">
            Authentic Montessori programs for children aged 2.5 to 6 years — designed to nurture curiosity,
            independence, and a lifelong love of learning.
          </p>

          <div className="space-y-12">
            {montessoriPrograms.map(({ id, title, age, icon, overview, details, schedule }) => (
              <article key={id} id={id} className="bg-falcon-cream rounded-3xl p-8 border border-falcon-sand">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl" aria-hidden>{icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-falcon-sageDark">{title}</h3>
                    <span className="text-falcon-sage font-semibold text-sm">Ages {age}</span>
                  </div>
                </div>
                <p className="text-falcon-earth mb-6 text-lg">{overview}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-falcon-sageDark mb-3">What Your Child Will Learn</h4>
                    <ul className="space-y-2">
                      {details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-falcon-earth">
                          <span className="text-falcon-sage mt-1">✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-falcon-sand">
                    <h4 className="font-bold text-falcon-sageDark mb-2">Schedule</h4>
                    <p className="text-falcon-earth text-sm mb-4">{schedule}</p>
                    <Link
                      href="/admissions"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-falcon-sage text-white rounded-xl font-bold text-sm hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
                    >
                      <span aria-hidden>📋</span> Apply Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Programs */}
      <section className="py-16 bg-falcon-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-falcon-sageDark mb-4 text-center">
            Coaching & Academic Support
          </h2>
          <p className="text-falcon-earth text-center max-w-2xl mx-auto mb-12">
            Beyond early learning — we support school-going children with expert coaching,
            tutoring, and after-school programs.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {additionalPrograms.map(({ id, title, target, icon, badge, overview, details, schedule }) => (
              <article key={id} id={id} className="bg-white rounded-3xl p-8 border border-falcon-sand">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl" aria-hidden>{icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-xl text-falcon-sageDark">{title}</h3>
                      <span className="px-2 py-0.5 bg-falcon-sage/15 text-falcon-sage rounded-full text-xs font-bold">{badge}</span>
                    </div>
                    <span className="text-falcon-earth/70 text-sm">{target}</span>
                  </div>
                </div>
                <p className="text-falcon-earth mb-5">{overview}</p>
                <ul className="space-y-2 mb-5">
                  {details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-falcon-earth">
                      <span className="text-falcon-sage mt-1">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-falcon-sand">
                  <p className="text-sm text-falcon-earth/70">{schedule}</p>
                  <Link
                    href="/admissions"
                    className="text-falcon-sage font-bold text-sm hover:text-falcon-sageDark transition-colors"
                  >
                    Enroll →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            Ready to Enroll Your Child?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Admissions open for all programs — limited seats for 2026. Apply early to secure your spot.
          </p>
          <Link
            href="/admissions"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
          >
            <span aria-hidden>🎓</span> Apply for Admission
          </Link>
        </div>
      </section>
    </>
  );
}
