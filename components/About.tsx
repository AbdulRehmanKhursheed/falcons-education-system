import { SITE_CONFIG } from '@/lib/constants';

const whyChooseUs = [
  {
    icon: '🎯',
    title: 'Child-Centered Learning',
    description:
      'We follow the proven Montessori method, letting each child learn at their own pace and follow their natural curiosity.',
  },
  {
    icon: '👩‍🏫',
    title: 'Qualified, Caring Teachers',
    description:
      "Our dedicated educators are trained in Montessori philosophy and committed to every child's emotional and intellectual growth.",
  },
  {
    icon: '🏡',
    title: 'Safe, Prepared Environment',
    description:
      'Our classrooms are thoughtfully designed with age-appropriate materials that invite exploration and independent discovery.',
  },
  {
    icon: '🌍',
    title: 'Holistic Development',
    description:
      'From practical life skills to mathematics and language — we develop the whole child: mind, body, and character.',
  },
  {
    icon: '📍',
    title: 'Convenient Location',
    description:
      'Easily accessible on Kamalabad Road, near Bakra Mandi, Rawalpindi — serving Sonari, Satellite Town, and nearby areas.',
  },
  {
    icon: '💬',
    title: 'Open Parent Communication',
    description:
      'We believe parents are partners. Regular updates, open visits, and WhatsApp communication keep you connected.',
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
              <strong>Falcons Education System</strong> opened its doors in August 2024 with a clear
              mission: to offer the best Montessori early childhood education in Rawalpindi, rooted
              in love, respect, and child-led discovery.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-4">
              Located on Kamalabad Road in Rawalpindi, we serve families in Sonari, Bakra Mandi,
              Satellite Town, and surrounding areas. Our prepared classrooms, qualified teachers,
              and Montessori-certified curriculum help every child develop independence, curiosity,
              and a lifelong love of learning.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-8">
              We believe every child is unique. Our philosophy allows children to explore at their
              own pace, build confidence, and lay a strong foundation for their school journey.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="text-center p-4 bg-falcon-cream rounded-xl border border-falcon-sand/50"
                >
                  <p className="font-display font-bold text-2xl text-falcon-sageDark">{value}</p>
                  <p className="text-sm text-falcon-earth mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative">
            <div
              className="aspect-[4/3] rounded-3xl overflow-hidden bg-falcon-sand/50 border-2 border-dashed border-falcon-sage/30 flex items-center justify-center shadow-sm"
              aria-label="About section image placeholder"
            >
              <div className="text-center p-8">
                <span className="text-6xl mb-3 block" aria-hidden>📸</span>
                <p className="text-falcon-earth/70 font-semibold">Add school or campus photo</p>
                <p className="text-sm text-falcon-earth/50 mt-1">
                  Classroom interior, building exterior, or children at activity
                </p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-falcon-sand/50 hidden sm:block">
              <p className="font-display font-bold text-falcon-sageDark text-sm">
                🦅 {SITE_CONFIG.name}
              </p>
              <p className="text-xs text-falcon-earth">Rawalpindi, Pakistan</p>
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
              We combine the best of Montessori education with a warm, family-friendly atmosphere in
              the heart of Rawalpindi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map(({ icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl bg-falcon-cream border border-falcon-sand/40 hover:border-falcon-sage/30 hover:shadow-sm transition-all"
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
