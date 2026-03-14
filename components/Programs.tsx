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
  {
    id: 'saturday-coaching',
    title: 'Saturday Coaching',
    age: 'School-going children',
    description:
      'Weekend coaching and tutoring for school-going children. Expert academic support in core subjects, exam preparation, and guided homework help every Saturday.',
    features: ['Core subject tutoring', 'Exam preparation', 'Homework support', 'Small group attention'],
    icon: '📝',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'evening-academy',
    title: 'Evening Academy',
    age: 'School-going children',
    description:
      'After-school evening program providing homework help, academic reinforcement, reading practice, and creative activities in a safe, supervised environment.',
    features: ['Homework completion', 'Subject reinforcement', 'Reading & writing', 'Creative activities'],
    icon: '🌙',
    color: 'bg-indigo-50 border-indigo-200',
    badgeColor: 'bg-indigo-100 text-indigo-800',
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
            Programs & Courses for Every Child
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            From Montessori early learning to Saturday coaching and evening classes —
            we support your child at every stage.
          </p>
        </div>

        {/* Montessori Programs */}
        <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-6 text-center">
          Montessori Early Learning
        </h3>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {programs.slice(0, 3).map(({ id, title, age, description, features, icon, color, badgeColor }) => (
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

        {/* New Programs: Saturday Coaching + Evening Academy */}
        <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-6 text-center">
          Coaching & Academic Support
        </h3>
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {programs.slice(3).map(({ id, title, age, description, features, icon, color, badgeColor }) => (
            <article
              key={id}
              id={id}
              className={`rounded-2xl p-6 sm:p-8 border ${color} hover:shadow-md transition-all bg-white`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl" aria-hidden>{icon}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-falcon-sage/10 text-falcon-sage rounded-full text-xs font-bold">
                  NEW
                </div>
              </div>
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
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-md tap-target"
          >
            <span aria-hidden>📋</span>
            <span>Apply for Admission</span>
          </Link>
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
