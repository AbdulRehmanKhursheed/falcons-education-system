import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { blogArticles } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog — Parenting Tips, Montessori Education & School News',
  description:
    'Read articles on Montessori education, parenting tips, preschool activities, and school updates from Falcons Education System Rawalpindi.',
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: 'Blog — Falcons Education System Rawalpindi',
    description: 'Parenting tips, Montessori insights, and school news for Rawalpindi parents.',
    url: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  return (
    <>
      <section className="py-16 sm:py-20 bg-gradient-to-b from-falcon-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">Blog</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-falcon-sageDark mb-6">
            Parenting Tips & Montessori Insights
          </h1>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Helpful articles for parents in Rawalpindi — from choosing the right school to
            Montessori activities you can do at home.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {blogArticles.map((article) => (
              <article
                key={article.slug}
                className="bg-falcon-cream rounded-2xl p-6 sm:p-8 border border-falcon-sand hover:border-falcon-sage/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-0.5 bg-falcon-sage/10 text-falcon-sage rounded-full text-xs font-bold">
                    {article.category}
                  </span>
                  <span className="text-falcon-earth/50 text-xs">{article.readTime}</span>
                </div>
                <Link href={`/blog/${article.slug}`}>
                  <h2 className="font-display font-bold text-xl text-falcon-sageDark mb-3 hover:text-falcon-sage transition-colors">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-falcon-earth mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <time className="text-xs text-falcon-earth/50" dateTime={article.publishedDate}>
                    {new Date(article.publishedDate).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-falcon-sage font-bold text-sm hover:text-falcon-sageDark transition-colors"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-falcon-sageDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl mb-4">
            Ready for the Next Step?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Give your child the best start with Montessori education. Admissions open for 2026.
          </p>
          <Link
            href="/admissions"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-falcon-sageDark rounded-2xl font-bold text-lg hover:bg-falcon-cream transition-all shadow-lg tap-target"
          >
            <span aria-hidden>🎓</span> Apply for Admission
          </Link>
        </div>
      </section>
    </>
  );
}
