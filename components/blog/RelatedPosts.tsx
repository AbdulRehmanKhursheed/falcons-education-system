import Link from 'next/link';
import type { BlogArticle } from '@/lib/blog/types';

/** "Keep reading" cards linking to other blog posts. */
export function RelatedPosts({ posts }: { posts: BlogArticle[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-extrabold text-ink">
        Keep reading
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-paper transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <p className="text-xs font-extrabold text-brand-dark">{post.category}</p>
            <h3 className="mt-2 text-[0.95rem] font-extrabold leading-snug text-ink group-hover:text-brand-dark">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
