import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { blogArticles } from '@/lib/blog-data';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';

export const metadata: Metadata = {
  title: 'Journal — Parenting Tips, Montessori Education & School News',
  description:
    'Read articles on Montessori education, parenting tips, preschool activities, and school updates from Falcons Education System Rawalpindi.',
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: 'Journal — Falcons Education System Rawalpindi',
    description: 'Parenting tips, Montessori insights, and school news for Rawalpindi parents.',
    url: `${SITE_CONFIG.url}/blog`,
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const [featured, ...rest] = blogArticles;

  return (
    <>
      <section className="bg-paper pb-6 pt-14 md:pt-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
              The <span className="text-brand">Journal</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              Honest writing for Rawalpindi parents — choosing schools, Montessori at home,
              health, and how children actually learn.
            </p>
          </FadeIn>
        </div>
      </section>

      {featured && (
        <section className="bg-paper py-12 md:py-16" aria-label="Latest article">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <FadeIn>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-3xl bg-navy p-8 shadow-rise transition-transform hover:-translate-y-1 md:p-12"
              >
                <p className="text-sm font-extrabold text-sun">
                  Latest · {featured.category} · {featured.readTime}
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-white/65">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand-tint group-hover:text-white">
                  Read the article
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      <section className="bg-paper pb-20 md:pb-28" aria-label="All articles">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.04}>
            {rest.map((article) => (
              <StaggerItem key={article.slug}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-paper transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <p className="text-xs font-extrabold text-brand">
                    {article.category} · {article.readTime}
                  </p>
                  <h2 className="mt-2.5 text-lg font-extrabold leading-snug text-ink group-hover:text-brand-dark">
                    {article.title}
                  </h2>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {article.excerpt}
                  </p>
                  <time
                    className="mt-auto pt-4 text-xs font-semibold text-ink-faint"
                    dateTime={article.publishedDate}
                  >
                    {formatDate(article.publishedDate)}
                  </time>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
