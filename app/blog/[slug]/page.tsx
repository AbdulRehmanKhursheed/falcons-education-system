import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight, ArrowLeft, GraduationCap, Phone } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { blogArticles } from '@/lib/blog-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.keywords,
    alternates: { canonical: `${SITE_CONFIG.url}/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_CONFIG.url}/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.publishedDate,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: `${SITE_CONFIG.url}/opengraph-image`,
    datePublished: article.publishedDate,
    author: {
      '@type': 'Organization',
      name: 'Falcons Education System',
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Falcons Education System',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    mainEntityOfPage: `${SITE_CONFIG.url}/blog/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <nav className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] font-semibold text-ink-faint" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span aria-hidden>·</span>
            <Link href="/blog" className="hover:text-ink transition-colors">Blogs</Link>
            <span aria-hidden>·</span>
            <span className="text-accent">{article.category}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="bg-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">

          {/* Meta */}
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[11px] uppercase tracking-[0.18em] font-semibold text-ink-faint mb-8">
            <span className="text-accent">{article.category}</span>
            <span aria-hidden>·</span>
            <time className="font-mono normal-case tracking-tight text-[12px]" dateTime={article.publishedDate}>
              {formatDate(article.publishedDate)}
            </time>
            <span aria-hidden>·</span>
            <span>{article.readTime}</span>
          </div>

          {/* Title */}
          <h1
            className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.1]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="mt-8 pl-5 border-l-2 border-accent text-[1.15rem] text-ink-soft leading-[1.7] italic font-display"
             style={{ fontVariationSettings: '"opsz" 24, "SOFT" 100' }}>
            {article.excerpt}
          </p>

          {/* Body — react-markdown with editorial typography */}
          <div className="mt-12 prose-editorial">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-14 mb-5 font-display text-2xl sm:text-[1.75rem] text-ink leading-[1.2]" style={{ fontVariationSettings: '"opsz" 48' }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-10 mb-3 font-display text-xl text-ink leading-[1.3]" style={{ fontVariationSettings: '"opsz" 24' }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-5 text-[1.05rem] text-ink-soft leading-[1.75]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-6 space-y-3 pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-6 space-y-3 pl-1 list-decimal list-inside marker:text-accent marker:font-mono marker:text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-3 text-[1.02rem] text-ink-soft leading-[1.7]">
                    <span aria-hidden className="mt-2.5 inline-block h-1 w-3 bg-accent shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-ink">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-ink" style={{ fontVariationSettings: '"opsz" 24, "SOFT" 100' }}>
                    {children}
                  </em>
                ),
                a: ({ href, children }) => (
                  <Link
                    href={href || '#'}
                    className="text-brand font-medium underline decoration-line decoration-1 underline-offset-[5px] hover:decoration-brand transition-colors"
                  >
                    {children}
                  </Link>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-10 pl-6 border-l-2 border-accent font-display text-[1.35rem] text-ink leading-[1.45] italic"
                              style={{ fontVariationSettings: '"opsz" 24, "SOFT" 100' }}>
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-12 border-t border-line" />,
                table: ({ children }) => (
                  <div className="my-10 overflow-x-auto border border-line">
                    <table className="w-full text-[14px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-paper-warm border-b border-line">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-5 py-3 text-ink-soft border-t border-line-soft align-top">
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 bg-paper-warm border border-line-soft rounded text-[0.92em] font-mono text-ink">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="my-8 p-5 bg-ink text-paper text-[13px] font-mono overflow-x-auto rounded-md">
                    {children}
                  </pre>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* CTA card */}
          <aside className="relative mt-16">
            <span aria-hidden className="absolute -top-2 -left-2 h-5 w-5 border-t border-l border-accent" />
            <span aria-hidden className="absolute -bottom-2 -right-2 h-5 w-5 border-b border-r border-accent" />
            <div className="border border-line bg-paper-warm/60 p-8 sm:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Admissions · 2026
              </p>
              <h3 className="mt-4 font-display text-2xl sm:text-3xl text-ink" style={{ fontVariationSettings: '"opsz" 48' }}>
                Bring your child for a quiet visit.
              </h3>
              <p className="mt-3 text-ink-soft text-[15px] leading-[1.7] max-w-lg">
                Admissions are open at Falcons Education System on Kamalabad Road,
                Rawalpindi. Call ahead and we&apos;ll walk you through the rooms.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/admissions"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[14px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                >
                  <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
                  Apply for admission
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </Link>
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-[14px] font-semibold text-ink hover:border-ink transition-colors"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  <span className="font-mono tracking-tight">{SITE_CONFIG.phone}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Back link */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink underline decoration-line decoration-1 underline-offset-[6px] hover:text-brand hover:decoration-brand transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              All blog posts
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
