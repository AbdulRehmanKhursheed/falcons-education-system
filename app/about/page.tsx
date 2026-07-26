import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Users,
  Shield,
  Sprout,
  Globe,
  TrendingUp,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/Motion";
import { Photo } from "@/components/ui/Photo";

export const metadata: Metadata = {
  title: "About Us — School Play Group to Class 6 in Rawalpindi",
  description:
    "Learn about Falcons Education System — a school on Kamalabad Road, Rawalpindi offering classes from Play Group to Class 6, plus an Evening Coaching Academy up to Matric, Spoken English and Computer Courses.",
  alternates: { canonical: `${SITE_CONFIG.url}/about` },
  openGraph: {
    title:
      "About Falcons Education System — School Play Group to Class 6, Rawalpindi",
    description:
      "Quality school education from Play Group to Class 6, with evening coaching up to Matric, on Kamalabad Road, Rawalpindi.",
    url: `${SITE_CONFIG.url}/about`,
  },
};

const VALUES = [
  {
    icon: Sprout,
    title: "Child-centered learning",
    text: "Every child learns at their own pace through hands-on exploration, not one-speed lectures.",
  },
  {
    icon: Heart,
    title: "Love & respect",
    text: "Warmth, patience and genuine care — children learn best where they feel safe being themselves.",
  },
  {
    icon: Users,
    title: "Parent partnership",
    text: "Regular updates, open communication, and walk-in visits. You always know how your child is doing.",
  },
  {
    icon: Globe,
    title: "Whole-child development",
    text: "Mind, body, creativity and character — we prepare children for life, not just exams.",
  },
  {
    icon: Shield,
    title: "Safe environment",
    text: "Clean, secure, thoughtfully designed classrooms where children feel free to explore.",
  },
  {
    icon: TrendingUp,
    title: "Continuous growth",
    text: "We keep improving our curriculum, materials and teaching — the school learns too.",
  },
];

const WHY_CHOOSE = [
  {
    title: "Small classes, by design",
    text: "Every teacher knows every child by name — what she finds easy, what she avoids, who she sits with.",
  },
  {
    title: "One campus, Play Group to Class 6",
    text: "Your child grows up in one familiar place — no school-hunting again at every stage.",
  },
  {
    title: "Support after the bell",
    text: "Evening Coaching Academy for Play Group to Matric (3:30–7:00 PM, Mon–Sat), plus separate spoken English and computer courses — under the same roof.",
  },
  {
    title: "Parents always welcome",
    text: "Walk in any working morning, watch a class, ask anything. No appointment needed.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              A small school with a{" "}
              <span className="text-brand">big promise</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Falcons Education System opened with one belief: every child
              deserves a joyful start — and a teacher who actually knows them.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:gap-14 md:px-8">
          <FadeIn>
            <Photo
              alt="Falcons Education System campus on Kamalabad Road, Rawalpindi"
              label="Campus photo — coming soon"
              tone="sky"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/3] w-full rounded-3xl shadow-card"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
              Our story
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              We&apos;re on Street 14, Sonari Bank, Kamalabad Road — near Bakra
              Mandi, Rawalpindi. The journey starts in our Montessori rooms
              (Play Group, Nursery, KG) and continues through primary
              school to Class 6 on the modern curriculum.
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">
              After the school day ends, the building keeps teaching: the
              Evening Coaching Academy runs 3:30–7:00 PM from Monday to Saturday, and computer courses give young students
              their first real digital skills — all open to children from any
              school in the area.
            </p>
            <Link
              href="/programs"
              className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand hover:text-brand-dark"
            >
              See all programs
              <ArrowRight size={17} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* A letter from the principal — real person, real words */}
      <section className="bg-paper py-10 md:py-16" aria-labelledby="letter-heading">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <FadeIn>
            <div className="relative rotate-[0.5deg] rounded-lg border border-line bg-white p-8 shadow-card md:p-12">
              <p
                id="letter-heading"
                className="text-sm font-extrabold uppercase tracking-widest text-brand"
              >
                A note from the Principal
              </p>
              <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
                <p>Dear parents,</p>
                <p>
                  Every morning I stand at the gate and watch the children walk in — some
                  running, some still rubbing their eyes. My promise to their parents is
                  simple: by the time your child leaves this gate in the afternoon, someone
                  here will have noticed them. What they did well today. What they found
                  hard. Who they laughed with.
                </p>
                <p>
                  We are not the biggest school in Rawalpindi, and we don&apos;t want to be.
                  We want to be the school where the teacher calls you before you have to
                  call her.
                </p>
                <p>
                  Come visit us. See the classrooms while they&apos;re working, not after
                  they&apos;ve been arranged for guests. Then decide.
                </p>
              </div>
              <p className="mt-8 font-display text-xl font-bold text-ink">
                — Aroosa
                <span className="mt-0.5 block text-sm font-semibold text-ink-faint">
                  Principal, Falcons Education System
                </span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section
        className="bg-paper-warm py-16 md:py-24"
        aria-labelledby="values-heading"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2
              id="values-heading"
              className="text-3xl font-extrabold text-ink md:text-4xl"
            >
              What we <span className="text-brand">stand for</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-2xl bg-white p-6 shadow-paper">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <v.icon size={21} />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {v.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section
        className="bg-paper py-16 md:py-24"
        aria-labelledby="why-choose-heading"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2
              id="why-choose-heading"
              className="text-3xl font-extrabold text-ink md:text-4xl"
            >
              Why parents <span className="text-brand">choose us</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {WHY_CHOOSE.map((w) => (
              <StaggerItem key={w.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                  <CheckCircle2 size={20} className="text-brand" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-ink">{w.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {w.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Come see it for yourself
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                The best way to judge a school is to walk through it on a
                working morning. You&apos;re welcome any day.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  Apply for admission
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
                >
                  Plan a visit
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
