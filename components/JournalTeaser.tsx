import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { blogArticles } from '@/lib/blog-data';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function JournalTeaser() {
  const latest = [...blogArticles]
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="relative bg-paper" aria-labelledby="journal-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Eyebrow>The journal</Eyebrow>
            <h2
              id="journal-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Notes on Montessori, parenting, and{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                early years
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            A quiet, growing collection of essays on child development, learning, and
            the daily work of raising young children — written for parents, not search engines.
          </p>
        </FadeIn>

        <Stagger className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {latest.map((post, i) => (
            <StaggerItem key={post.slug} className="bg-paper">
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full p-8 lg:p-10 hover:bg-paper-warm transition-colors"
              >
                <div className="flex items-baseline justify-between mb-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {post.category}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3
                  className="font-display text-[1.4rem] leading-[1.2] text-ink group-hover:text-brand transition-colors"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  {post.title}
                </h3>

                <p className="mt-4 text-[14px] text-ink-soft leading-[1.65] line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-8 flex items-baseline justify-between">
                  <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-faint">
                    {formatDate(post.publishedDate)} · {post.readTime}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn className="mt-12 text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-full border border-line px-7 py-4 text-[14px] font-semibold text-ink hover:border-ink hover:bg-ink hover:text-paper transition-all"
          >
            Read all journal entries
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
