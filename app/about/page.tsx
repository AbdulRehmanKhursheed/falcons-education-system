import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us — School Nursery to Class 6 in Rawalpindi",
  description:
    "Learn about Falcons Education System — a school on Kamalabad Road, Rawalpindi offering classes from Nursery to Class 6, plus Evening Coaching and Computer Courses. Founded August 2024.",
  alternates: { canonical: `${SITE_CONFIG.url}/about` },
  openGraph: {
    title: "About Falcons Education System — School Nursery to Class 6, Rawalpindi",
    description:
      "Quality school education from Nursery to Class 6, Saturday coaching, and evening academy on Kamalabad Road, Rawalpindi. Founded August 2024.",
    url: `${SITE_CONFIG.url}/about`,
  },
};

const milestones = [
  { year: "2024", event: "Founded in August on Kamalabad Road, Rawalpindi" },
  {
    year: "2024",
    event: "Launched Nursery, Montessori, KG, and primary Class 1–6 programs",
  },
  { year: "2025", event: "Introduced Saturday Coaching and Evening Academy" },
  { year: "2025", event: "Launched Computer Courses for Kids" },
  {
    year: "2026",
    event: "Expanding admissions — growing community of happy families",
  },
];

const values = [
  {
    icon: "🌱",
    title: "Child-Centered Learning",
    text: "Every child learns at their own pace through hands-on exploration and self-directed activity.",
  },
  {
    icon: "❤️",
    title: "Love & Respect",
    text: "We treat every child with warmth, patience, and genuine care — like our own family.",
  },
  {
    icon: "🤝",
    title: "Parent Partnership",
    text: "Parents are our partners. Regular updates, open communication, and walk-in visits keep you connected.",
  },
  {
    icon: "🌍",
    title: "Whole-Child Development",
    text: "We develop mind, body, creativity, and character — preparing children for life, not just exams.",
  },
  {
    icon: "🏡",
    title: "Safe Environment",
    text: "Clean, secure, and thoughtfully designed classrooms where children feel safe to explore.",
  },
  {
    icon: "📈",
    title: "Continuous Growth",
    text: "We constantly improve our curriculum, materials, and teaching methods for better outcomes.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            About Us
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Where Learning Begins with Joy
          </h1>
          <p className="text-falcon-earth text-lg leading-relaxed max-w-2xl mx-auto">
            <strong>Falcons Education System</strong> was founded in August 2024
            with a clear mission: to provide quality school education — from
            Nursery all the way to Class 6 — rooted in love, respect, and a
            genuine desire for every child to succeed.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-4">
                Our Story
              </h2>
              <p className="text-falcon-earth leading-relaxed mb-4">
                Located at{" "}
                <strong>
                  Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi,
                  Rawalpindi
                </strong>
                , Falcons Education System started with a simple belief: every
                child deserves a joyful start to their educational journey.
              </p>
              <p className="text-falcon-earth leading-relaxed mb-4">
                Our school offers a complete education journey — starting with
                Montessori early learning (Nursery, Montessori, KG) and
                continuing through{" "}
                <strong>primary school up to Class 6</strong>. Our qualified
                teachers follow the national curriculum, delivering structured,
                engaging lessons that build strong academic foundations.
              </p>
              <p className="text-falcon-earth leading-relaxed">
                Beyond regular school hours, we also provide{" "}
                <strong>Evening Coaching Academy</strong> (3:30 PM – 7:30 PM),{" "}
                <strong>Saturday Coaching</strong>, and{" "}
                <strong>Computer Courses for Kids</strong> — making Falcons
                Education System a complete academic partner for families in
                Rawalpindi.
              </p>
            </div>

            {/* Image placeholder */}
            <div
              className="aspect-[4/3] rounded-3xl overflow-hidden bg-falcon-cream border-2 border-dashed border-falcon-sand flex items-center justify-center shadow-sm"
              aria-label="School photo placeholder"
            >
              <div className="text-center p-8">
                <span className="text-6xl mb-3 block" aria-hidden>
                  📸
                </span>
                <p className="text-falcon-earth/70 font-semibold">
                  Add school photo
                </p>
                <p className="text-sm text-falcon-earth/50 mt-1">
                  Campus, classroom, or team photo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-falcon-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-falcon-sageDark mb-10 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon, title, text }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-2xl bg-white border border-falcon-sand hover:border-falcon-sage/50 hover:shadow-sm transition-all"
              >
                <span className="text-3xl shrink-0 mt-0.5" aria-hidden>
                  {icon}
                </span>
                <div>
                  <h3 className="font-display font-bold text-falcon-sageDark mb-1">
                    {title}
                  </h3>
                  <p className="text-falcon-earth text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-falcon-sageDark mb-10 text-center">
            Our Journey
          </h2>
          <div className="space-y-6">
            {milestones.map(({ year, event }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-falcon-sage text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {year}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-falcon-sand mt-2" />
                  )}
                </div>
                <p className="text-falcon-earth pt-2">{event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            Join the Falcons Family
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Give your child the best start in life. Admissions are open for 2026
            — limited seats available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
            >
              <span aria-hidden>🎓</span> Apply for Admission
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all tap-target"
            >
              <span aria-hidden>📍</span> Visit Our Campus
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
