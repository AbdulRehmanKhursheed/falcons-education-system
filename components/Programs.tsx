import Link from 'next/link';

const programs = [
  {
    title: 'Nursery',
    age: '2.5 – 3.5 years',
    description:
      'Our Nursery program introduces young children to the Montessori environment in Rawalpindi. Focus is on practical life skills, sensorial exploration, social skills, and language development in a warm, nurturing setting.',
    features: ['Practical life activities', 'Sensorial materials', 'Language introduction', 'Social-emotional development'],
    icon: '🌱',
    color: 'bg-falcon-sky/20 border-falcon-sky/40',
    badgeColor: 'bg-falcon-sky/30 text-falcon-skyDark',
  },
  {
    title: 'Montessori Level',
    age: '3 – 6 years',
    description:
      'The full Montessori curriculum with prepared environments and self-directed learning. Covers practical life, sensorial, language, mathematics, and cultural studies. The cornerstone of early childhood education in Rawalpindi.',
    features: ['Full Montessori materials', 'Math & language work', 'Cultural studies', 'Child-led learning'],
    icon: '📚',
    color: 'bg-falcon-sage/10 border-falcon-sage/30',
    badgeColor: 'bg-falcon-sage/20 text-falcon-sageDark',
  },
  {
    title: 'KG (Kindergarten)',
    age: '4 – 6 years',
    description:
      'KG bridges Montessori to formal schooling. We reinforce Montessori foundations while introducing structured activities and early academics, preparing children confidently for primary school.',
    features: ['Reading & writing', 'Number concepts', 'Science exploration', 'School readiness'],
    icon: '🎓',
    color: 'bg-falcon-warm border-falcon-sand',
    badgeColor: 'bg-amber-100 text-amber-800',
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
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            Montessori Programs
          </p>
          <h2
            id="programs-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Our Early Childhood Programs
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Age-appropriate Montessori and preschool programs in Rawalpindi, designed to nurture
            every child&apos;s natural curiosity, independence, and joy of learning.
          </p>
        </div>

        {/* Program cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {programs.map(({ title, age, description, features, icon, color, badgeColor }) => (
            <article
              key={title}
              className={`rounded-2xl p-6 sm:p-8 border ${color} hover:shadow-md transition-all bg-white`}
            >
              <div className="text-4xl mb-4" aria-hidden>
                {icon}
              </div>
              <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-1">
                {title}
              </h3>
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
            Daily Activities at Falcons Education System
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
            href="#admissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-md tap-target"
          >
            <span aria-hidden>📋</span>
            <span>Apply for Admission</span>
          </Link>
          <p className="mt-3 text-sm text-falcon-earth/60">
            Admissions open for all programs — limited seats available
          </p>
        </div>
      </div>
    </section>
  );
}
