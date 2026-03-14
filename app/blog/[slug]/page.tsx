import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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

function renderMarkdownContent(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 mb-6 pl-1">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-falcon-earth">
              <span className="text-falcon-sage mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-falcon-sage font-semibold hover:underline">$1</a>');
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="font-display font-bold text-2xl text-falcon-sageDark mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList();
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-falcon-earth leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }
  }
  flushList();

  return elements;
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
      <div className="bg-falcon-cream border-b border-falcon-sand/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm text-falcon-earth/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-falcon-sage transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-falcon-sage transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-falcon-earth">{article.category}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-0.5 bg-falcon-sage/10 text-falcon-sage rounded-full text-xs font-bold">
              {article.category}
            </span>
            <span className="text-falcon-earth/50 text-xs">{article.readTime}</span>
            <time className="text-falcon-earth/50 text-xs" dateTime={article.publishedDate}>
              {new Date(article.publishedDate).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-falcon-earth text-lg leading-relaxed mb-8 border-l-4 border-falcon-sage pl-4">
            {article.excerpt}
          </p>

          {/* Content */}
          <div>{renderMarkdownContent(article.content)}</div>

          {/* CTA Box */}
          <div className="mt-12 bg-falcon-cream rounded-2xl p-6 sm:p-8 border border-falcon-sand text-center">
            <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-3">
              Ready to Enroll Your Child?
            </h3>
            <p className="text-falcon-earth mb-6">
              Admissions are open for 2026 at Falcons Education System, Kamalabad Road, Rawalpindi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/admissions"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-bold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
              >
                <span aria-hidden>🎓</span> Apply for Admission
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-falcon-sage/30 text-falcon-sageDark rounded-xl font-bold hover:bg-falcon-sage/5 transition-colors tap-target"
              >
                <span aria-hidden>📞</span> Contact Us
              </Link>
            </div>
          </div>

          {/* Back to blog */}
          <div className="mt-8 text-center">
            <Link href="/blog" className="text-falcon-sage font-semibold hover:text-falcon-sageDark transition-colors">
              ← Back to All Articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
