import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/Motion";
import { Photo } from "@/components/ui/Photo";

type ProgramRow = {
  href: string;
  kicker: string;
  kickerColor: string;
  title: string;
  body: string;
  src?: string;
  imageAlt: string;
  imageLabel?: string;
  tone: "sky" | "sun" | "navy";
};

const PROGRAMS: ProgramRow[] = [
  {
    href: "/programs#montessori",
    kicker: "Ages 3 - 6",
    kickerColor: "text-brand",
    title: "Montessori early years",
    body: "Children learn by doing — practical life, sensorial materials, and language in a calm, prepared environment that lets each child move at their own pace.",
    src: "/images/montessori.jpg",
    imageAlt:
      "Child working with Montessori golden bead materials while a teacher guides her hands",
    tone: "sky",
  },
  {
    href: "/programs#class-1-2",
    kicker: "Class 1 – 6",
    kickerColor: "text-flame",
    title: "Primary school",
    body: "English, Urdu, Mathematics, Science and more — small classes, national syllabus, and teachers who know every child by name.",
    src: "/images/primary.jpg",
    imageAlt:
      "Primary school students raising their hands eagerly in a bright classroom",
    tone: "sun",
  },
  {
    href: "/coaching",
    kicker: "Evening · Mon – Sat · Play Group to Matric",
    kickerColor: "text-brand-dark",
    title: "Coaching, computer & spoken English classes",
    body: "After-school help with homework and exams, plus computer and spoken English classes — so kids from any school can catch up and get ahead. All updates on the Coaching Academy page.",
    src: "/images/coaching.jpg",
    imageAlt:
      "Evening coaching session — a tutor helping three children with homework under warm lamp light",
    tone: "navy",
  },
];

export function ProgramRows() {
  return (
    <section
      className="bg-paper py-20 md:py-28"
      aria-labelledby="programs-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <h2
            id="programs-heading"
            className="max-w-2xl text-4xl font-extrabold text-ink sm:text-5xl md:text-6xl"
          >
            One school. <span className="text-brand">Three ways</span> to grow.
          </h2>
        </FadeIn>

        <div className="mt-14 flex flex-col gap-16 md:mt-20 md:gap-24">
          {PROGRAMS.map((p, i) => (
            <FadeIn key={p.href}>
              <Link
                href={p.href}
                className={`group grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Photo
                  src={p.src}
                  alt={p.imageAlt}
                  label={p.imageLabel}
                  tone={p.tone}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[4/3] w-full rounded-3xl shadow-card transition-transform duration-500 group-hover:scale-[1.015]"
                />
                <div>
                  <p className={`text-sm font-extrabold ${p.kickerColor}`}>
                    {p.kicker}
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold text-ink md:text-4xl">
                    {p.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
                    {p.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-brand transition-colors group-hover:text-brand-dark">
                    Learn more
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
