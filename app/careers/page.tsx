import type { Metadata } from 'next';
import { Heart, TrendingUp, Home, HandHeart, ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import careersData from '@/lib/careers-data.json';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';

export const metadata: Metadata = {
  title: 'Careers — Join Our Teaching Team',
  description:
    'Careers at Falcons Education System Rawalpindi. We are hiring passionate Montessori teachers, coaching tutors, and support staff. Apply today.',
  alternates: { canonical: `${SITE_CONFIG.url}/careers` },
  openGraph: {
    title: 'Careers at Falcons Education System — Teaching Jobs Rawalpindi',
    description:
      'Join our growing team. We are hiring Montessori teachers, tutors, and support staff.',
    url: `${SITE_CONFIG.url}/careers`,
  },
};

interface Position {
  title: string;
  type: string;
  description: string;
  requirements: string[];
  active: boolean;
}

const PERKS = [
  {
    icon: Heart,
    title: 'A team, not a hierarchy',
    text: 'Small staff, honest room culture, and salaries paid on time — every time.',
  },
  {
    icon: TrendingUp,
    title: 'Real growth',
    text: 'Montessori training and development opportunities as the school grows.',
  },
  {
    icon: Home,
    title: 'A campus you can be proud of',
    text: 'Clean, well-maintained school on Kamalabad Road, Rawalpindi.',
  },
  {
    icon: HandHeart,
    title: 'Work that matters',
    text: 'Your patience on a Tuesday morning shapes someone’s whole life.',
  },
];

export default function CareersPage() {
  const openings = (careersData as Position[]).filter((p) => p.active);
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+apply+for+a+teaching+position+at+Falcons+Education+System.+My+CV+is+attached.`;

  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              Teach where you&apos;re <span className="text-brand">known by name</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              We&apos;re a young school in Rawalpindi building something worth belonging to. If
              children and learning are your thing, we&apos;d like to meet you.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper-warm py-16 md:py-24" aria-labelledby="perks-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="perks-heading" className="text-3xl font-extrabold text-ink md:text-4xl">
              Why teachers <span className="text-brand">stay with us</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {PERKS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full gap-4 rounded-2xl bg-white p-6 shadow-paper">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <p.icon size={21} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-ink">{p.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">{p.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24" aria-labelledby="openings-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="openings-heading" className="text-3xl font-extrabold text-ink md:text-4xl">
              {openings.length > 0 ? 'Open positions' : 'No openings right now'}
            </h2>
          </FadeIn>

          {openings.length > 0 ? (
            <Stagger className="mt-10 grid gap-6 md:grid-cols-2">
              {openings.map((job) => (
                <StaggerItem key={job.title}>
                  <div className="h-full rounded-2xl border border-line bg-white p-7 shadow-paper">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-brand">{job.type}</p>
                    <h3 className="mt-2 text-xl font-extrabold text-ink">{job.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{job.description}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {job.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2.5 text-sm text-ink-soft">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <FadeIn delay={0.1}>
              <p className="mt-5 max-w-2xl leading-relaxed text-ink-muted">
                But good teachers don&apos;t appear on schedule — so we keep every strong CV on
                file and call when a seat opens. If you teach Montessori, primary subjects, or
                computer skills, introduce yourself anyway.
              </p>
            </FadeIn>
          )}

          <FadeIn delay={0.15}>
            <div className="mt-12 rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
                Send us your CV
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                WhatsApp your CV with a few lines about yourself, or email{' '}
                <span className="font-semibold text-white/90">{SITE_CONFIG.email}</span>. We read
                everything and reply to everyone.
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Apply on WhatsApp
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
