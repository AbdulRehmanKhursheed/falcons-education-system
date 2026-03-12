const testimonials = [
  {
    name: 'Sara K.',
    role: 'Mother of a Nursery student',
    quote:
      'My daughter loves going to school every single day. The teachers at Falcons Education System are so caring and patient. The Montessori approach has really helped her develop confidence and independence.',
    rating: 5,
  },
  {
    name: 'Ahmad R.',
    role: 'Father of a KG student',
    quote:
      'Falcons Education System exceeded our expectations. The environment is clean, safe, and the staff genuinely care about each child. We are so glad we found this school.',
    rating: 5,
  },
  {
    name: 'Nadia M.',
    role: 'Mother of a Montessori Level student',
    quote:
      'Our son has made incredible progress in reading and math using the Montessori materials. The teachers are wonderful and truly care. Highly recommend to all parents!',
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-3" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24 bg-falcon-sageDark"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-falcon-sageLight font-semibold uppercase tracking-wider text-sm mb-3">
            Parent Reviews
          </p>
          <h2
            id="testimonials-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-white mb-4"
          >
            What Parents Say About Us
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Families trust Falcons Education System with their children&apos;s most
            important early years.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map(({ name, role, quote, rating }) => (
            <figure
              key={name}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col"
            >
              <StarRating count={rating} />
              <blockquote className="text-white/90 leading-relaxed flex-1 mb-6 italic">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption>
                <p className="font-display font-bold text-white">{name}</p>
                <p className="text-white/60 text-sm">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* CTA inside testimonials */}
        <div className="mt-14 text-center">
          <p className="text-white/80 text-lg mb-6">
            Join our growing family of happy students and parents.
          </p>
          <a
            href="#admissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
          >
            <span aria-hidden>🎓</span>
            <span>Apply for Admission Today</span>
          </a>
        </div>
      </div>
    </section>
  );
}
