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
      'Our educators are trained, supportive, and dedicated to every child\'s emotional, social, and intellectual growth.',
  },
  {
    icon: '🌙',
    title: 'Evening Coaching Classes',
    description:
      'We provide evening coaching from 3:30 PM to 7:30 PM, Monday–Friday, to help school-going children improve academically.',
  },
  {
    icon: '💻',
    title: 'Computer Courses for Kids',
    description:
      'Basic computer skills — typing, MS Word, and internet basics — to prepare children for today\'s digital world.',
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
      'Parents are our partners. Call or WhatsApp us at 0311-9911288. Regular updates and open visits keep you connected.',
  },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '6', label: 'Programs' },
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
              <strong>Falcons Education System</strong> is committed to providing quality
              education that helps children become confident, independent, and successful.
              Along with regular school education, we offer <strong>Evening Coaching Classes</strong> to
              help students improve their academic performance and build strong learning skills.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-4">
              Our mission is to create a supportive learning environment where every child
              can grow, learn, and achieve their full potential — from Nursery through KG,
              and with extra support through our coaching academy and computer courses.
            </p>
            <p className="text-falcon-earth text-lg leading-relaxed mb-8">
              Located on <strong>Kamalabad Road, Rawalpindi</strong>, we welcome families
              from across the community. Call us at <strong>0311-9911288</strong> to schedule
              a free visit or enquire about admissions.
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
              href="/admissions"
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
