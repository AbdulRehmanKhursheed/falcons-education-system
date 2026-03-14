import Link from 'next/link';

const programs = [
  {
    id: 'nursery',
    title: 'Nursery',
    age: '2.5 – 3.5 years',
    description:
      'Introduction to the Montessori environment. Focus on practical life skills, sensorial exploration, social skills, and language development in a warm, nurturing setting.',
    features: ['Practical life activities', 'Sensorial materials', 'Language introduction', 'Social-emotional development'],
    icon: '🌱',
    color: 'bg-falcon-sky/20 border-falcon-sky/40',
    badgeColor: 'bg-falcon-sky/30 text-falcon-skyDark',
  },
  {
    id: 'montessori',
    title: 'Montessori Level',
    age: '3 – 6 years',
    description:
      'The full Montessori curriculum with prepared environments and self-directed learning. Covers practical life, sensorial, language, mathematics, and cultural studies.',
    features: ['Full Montessori materials', 'Math & language work', 'Cultural studies', 'Child-led learning'],
    icon: '📚',
    color: 'bg-falcon-sage/10 border-falcon-sage/30',
    badgeColor: 'bg-falcon-sage/20 text-falcon-sageDark',
  },
  {
    id: 'kg',
    title: 'KG (Kindergarten)',
    age: '4 – 6 years',
    description:
      'Bridges Montessori to formal schooling. Reinforces Montessori foundations while introducing structured activities and early academics that prepare children for primary school.',
    features: ['Reading & writing', 'Number concepts', 'Science exploration', 'School readiness'],
    icon: '🎓',
    color: 'bg-falcon-warm border-falcon-sand',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
];

const coachingPrograms = [
  {
    id: 'evening-academy',
    title: 'Evening Coaching Academy',
    target: 'School-going children',
    icon: '🌙',
    badge: 'NEW',
    schedule: '3:30 PM – 7:30 PM | Mon – Fri',
    openSaturday: true,
    description:
      'After-school evening coaching classes to help students improve academic performance and build strong learning skills.',
    features: [
      'Improve understanding of all subjects',
      'Exam preparation and practice tests',
      'Strengthen basic concepts',
      'Build confidence in studies',
      'Supervised homework completion',
    ],
  },
  {
    id: 'saturday-coaching',
    title: 'Saturday Coaching',
    target: 'School-going children',
    icon: '📝',
    badge: 'NEW',
    schedule: '9:00 AM – 1:00 PM | Every Saturday',
    openSaturday: false,
    description:
      'Weekend coaching and tutoring for school-going children — core subject support, exam prep, and guided study sessions.',
    features: [
      'Core subject tutoring: English, Math, Science, Urdu',
      'Exam preparation and practice',
      'Guided homework completion',
      'Small group, individual attention',
    ],
  },
  {
    id: 'computer-courses',
    title: 'Computer Courses for Kids',
    target: 'Young students',
    icon: '💻',
    badge: 'NEW',
    schedule: 'Flexible timing — enquire for details',
    openSaturday: false,
    description:
      'Basic computer courses for young students to learn essential digital skills and become confident in today\'s technology-driven world.',
    features: [
      'Basic computer knowledge',
      'Typing skills',
      'Microsoft Word basics',
      'Internet basics',
    ],
  },
];

const activities = [
  { icon: '🎨', label: 'Arts & Crafts' },
  { icon: '🧩', label: 'Puzzle Work' },
  { icon: '🌿', label: 'Nature Study' },
  { icon: '🎵', label: 'Music & Rhymes' },
  { icon: '📖', label: 'Storytime' },
  { icon: '🏃', label: 'Physical Activity' },
];

export function Programs() {
  return (
    <section
      id="programs"
      className="py-16 sm:py-24 bg-falcon-cream"
      aria-labelledby="programs-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            Our Programs
          </p>
          <h2
            id="programs-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            School Education &amp; Coaching Classes
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Complete educational support for your child — from Montessori early learning
            to evening coaching, Saturday classes, and computer courses.
          </p>
        </div>

        {/* Montessori Programs */}
        <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-6 text-center">
          Montessori School Education
        </h3>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {programs.map(({ id, title, age, description, features, icon, color, badgeColor }) => (
            <article
              key={id}
              id={id}
              className={`rounded-2xl p-6 sm:p-8 border ${color} hover:shadow-md transition-all bg-white`}
            >
              <div className="text-4xl mb-4" aria-hidden>{icon}</div>
              <h4 className="font-display font-bold text-xl text-falcon-sageDark mb-1">{title}</h4>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold mb-3 ${badgeColor}`}>
                {age}
              </span>
              <p className="text-falcon-earth leading-relaxed mb-5 text-sm">{description}</p>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-falcon-earth">
                    <span className="w-4 h-4 rounded-full bg-falcon-sage/20 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-falcon-sage" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Coaching & Extra Programs */}
        <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-6 text-center">
          Evening Coaching &amp; Extra Classes
        </h3>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {coachingPrograms.map(({ id, title, target, icon, badge, schedule, description, features }) => (
            <article
              key={id}
              id={id}
              className="rounded-2xl p-6 sm:p-8 border border-falcon-sand hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl" aria-hidden>{icon}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-falcon-sage/10 text-falcon-sage rounded-full text-xs font-bold">
                  {badge}
                </div>
              </div>
              <h4 className="font-display font-bold text-xl text-falcon-sageDark mb-1">{title}</h4>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold mb-1 bg-indigo-100 text-indigo-800">
                {target}
              </span>
              <p className="text-falcon-sage text-xs font-bold mb-3">🕒 {schedule}</p>
              <p className="text-falcon-earth leading-relaxed mb-5 text-sm">{description}</p>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-falcon-earth">
                    <span className="w-4 h-4 rounded-full bg-falcon-sage/20 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-falcon-sage" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Activities strip */}
        <div className="bg-white rounded-2xl border border-falcon-sand/40 p-6 sm:p-8 shadow-sm">
          <h3 className="font-display font-bold text-xl text-falcon-sageDark text-center mb-6">
            Daily Activities
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {activities.map(({ icon, label }) => (
              <div key={label} className="text-center">
                <span className="text-3xl block mb-2" aria-hidden>{icon}</span>
                <p className="text-xs text-falcon-earth font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-md tap-target"
            >
              <span aria-hidden>🎓</span>
              <span>Apply for Admission</span>
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-falcon-sageDark text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-md tap-target"
            >
              <span aria-hidden>🌙</span>
              <span>Join Coaching Classes</span>
            </Link>
          </div>
          <p className="mt-3 text-sm text-falcon-earth/60">
            Admissions open for all programs — limited seats available for 2026
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-1 mt-4 text-falcon-sage font-semibold text-sm hover:text-falcon-sageDark transition-colors"
          >
            View all program details →
          </Link>
        </div>
      </div>
    </section>
  );
}
