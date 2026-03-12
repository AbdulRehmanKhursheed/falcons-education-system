import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const whyChooseUs = [
  {
    icon: '🎯',
    title: 'Authentic Montessori Method',
    description:
      'We follow the globally proven Montessori method — each child learns at their own pace through hands-on, self-directed exploration.',
  },
  {
    icon: '👩‍🏫',
    title: 'Qualified, Caring Teachers',
    description:
      "Our educators are trained in Montessori philosophy and dedicated to every child's emotional, social, and intellectual growth.",
  },
  {
    icon: '🏡',
    title: 'Safe, Prepared Environment',
    description:
      'Thoughtfully designed classrooms with age-appropriate Montessori materials that invite curiosity, independence, and confident exploration.',
  },
  {
    icon: '🌍',
    title: 'Holistic Child Development',
    description:
      'From practical life skills to mathematics and language — we develop the whole child: mind, body, creativity, and character.',
  },
  {
    icon: '🤝',
    title: 'Small Class Sizes',
    description:
      'Every child gets the individual attention they deserve. Our small class sizes allow teachers to truly know and nurture each student.',
  },
  {
    icon: '💬',
    title: 'Open Parent Communication',
    description:
      "Parents are our partners. Regular updates, open visits, and WhatsApp communication keep you connected to your child's progress.",
  },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '3', label: 'Programs' },
  { value: '2.5–6', label: 'Age Range (yrs)' },
  { value: '100%', label: 'Dedicated Care' },
];

export function About() {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-white"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main about block */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          <div>
            <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
              About Us
            </p>
            <h2
              id="about-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-6"
            >
              Where Learning Begins with Joy
            </h2>
            <p className="text-falcon-earth text-lg leading-relaxed mb-4">
              <strong>Falcons Education System</strong> opened in August 2024 with a clear
              mission: to bring authentic Montessori early childhood education to our community —
              rooted in love, respect, and child-led discovery.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-4">
              Our prepared classrooms, qualified teachers, and Montessori-certified curriculum
              help every child develop independence, confidence, and a genuine love of learning.
              We believe every child is unique and deserves the freedom to explore at their own
              pace.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-8">
              From practical life activities and sensorial exploration to mathematics and language
              arts — we lay a strong foundation that prepares children not just for school, but
              for life.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="text-center p-4 bg-falcon-cream rounded-xl border border-falcon-sand"
                >
                  <p className="font-display font-bold text-2xl text-falcon-sageDark">{value}</p>
                  <p className="text-sm text-falcon-earth mt-1">{label}</p>
                </div>
              ))}
            </div>

            <Link
              href="#admissions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-bold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
            >
              <span aria-hidden>🎓</span>
              <span>Apply for Admission</span>
            </Link>
          </div>

          {/* Image placeholder */}
          <div className="relative">
            <div
              className="aspect-[4/3] rounded-3xl overflow-hidden bg-falcon-cream border-2 border-dashed border-falcon-sand flex items-center justify-center shadow-sm"
              aria-label="School photo placeholder"
            >
              <div className="text-center p-8">
                <span className="text-6xl mb-3 block" aria-hidden>📸</span>
                <p className="text-falcon-earth/70 font-semibold">Add school or campus photo</p>
                <p className="text-sm text-falcon-earth/50 mt-1">
                  Classroom interior, building exterior, or children at activity
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-falcon-sand hidden sm:block">
              <p className="font-display font-bold text-falcon-sageDark text-sm">
                📍 {SITE_CONFIG.name}
              </p>
              <p className="text-xs text-falcon-earth">{SITE_CONFIG.address.city}, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4">
              Why Choose Falcons Education System?
            </h2>
            <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
              We combine authentic Montessori education with a warm, family-friendly atmosphere
              where every child feels valued.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl bg-falcon-cream border border-falcon-sand hover:border-falcon-sage/50 hover:shadow-sm transition-all"
              >
                <span className="text-3xl shrink-0 mt-0.5" aria-hidden>{icon}</span>
                <div>
                  <h3 className="font-display font-bold text-falcon-sageDark mb-1">{title}</h3>
                  <p className="text-falcon-earth text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
