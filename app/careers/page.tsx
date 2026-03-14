import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import careersData from '@/lib/careers-data.json';

export const metadata: Metadata = {
  title: 'Careers — Join Our Teaching Team',
  description:
    'Careers at Falcons Education System Rawalpindi. We are hiring passionate Montessori teachers, coaching tutors, and support staff. Apply today.',
  alternates: { canonical: `${SITE_CONFIG.url}/careers` },
  openGraph: {
    title: 'Careers at Falcons Education System — Teaching Jobs Rawalpindi',
    description: 'Join our growing team. We are hiring Montessori teachers, tutors, and support staff.',
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

export default function CareersPage() {
  const openings = (careersData as Position[]).filter((p) => p.active);
  const hasOpenings = openings.length > 0;

  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">Careers</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Join the Falcons Team
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            We are a growing school with a mission to transform early childhood education in Rawalpindi.
            If you share our passion for children and learning, we would love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-8 text-center">
            Why Work at Falcons Education System?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: '❤️', text: 'A supportive, family-like team that values every member' },
              { icon: '📈', text: 'Professional growth — Montessori training and development opportunities' },
              { icon: '🏡', text: 'Clean, well-maintained campus on Kamalabad Road, Rawalpindi' },
              { icon: '🤝', text: 'Meaningful work that makes a real difference in children\'s lives' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 p-4 bg-falcon-cream rounded-xl border border-falcon-sand">
                <span className="text-2xl shrink-0" aria-hidden>{icon}</span>
                <p className="text-falcon-earth text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-falcon-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-falcon-sageDark mb-10 text-center">
            {hasOpenings ? 'Open Positions' : 'No Open Positions Right Now'}
          </h2>

          {hasOpenings ? (
            <div className="space-y-6">
              {openings.map(({ title, type, description, requirements }) => (
                <article key={title} className="bg-white rounded-2xl p-6 sm:p-8 border border-falcon-sand shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h3 className="font-display font-bold text-xl text-falcon-sageDark">{title}</h3>
                    <span className="inline-block px-3 py-1 bg-falcon-sage/10 text-falcon-sage rounded-full text-xs font-bold">
                      {type}
                    </span>
                  </div>
                  <p className="text-falcon-earth mb-4">{description}</p>
                  <h4 className="font-bold text-falcon-sageDark text-sm mb-2">Requirements</h4>
                  <ul className="space-y-1.5 mb-5">
                    {requirements.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-falcon-earth">
                        <span className="text-falcon-sage mt-0.5">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:${SITE_CONFIG.email}?subject=Application: ${encodeURIComponent(title)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-falcon-sage text-white rounded-xl font-bold text-sm hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
                  >
                    <span aria-hidden>✉️</span> Apply via Email
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-falcon-sand">
              <span className="text-5xl mb-4 block" aria-hidden>📭</span>
              <p className="text-falcon-earth text-lg mb-2">We don&apos;t have openings at the moment.</p>
              <p className="text-falcon-earth/70 text-sm">
                But we are always happy to hear from talented people. Send your CV below!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            {hasOpenings ? 'Don\u2019t See Your Role?' : 'Interested in Future Openings?'}
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Send your CV and a brief introduction. We will keep you in mind for future opportunities.
          </p>
          <a
            href={`mailto:${SITE_CONFIG.email}?subject=General Application — Falcons Education System`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
          >
            <span aria-hidden>✉️</span> Send Your CV
          </a>
          <p className="text-white/50 text-sm mt-4">
            <Link href="/" className="hover:text-white transition-colors underline underline-offset-2">
              ← Back to Home
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
