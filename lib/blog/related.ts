import type { BlogArticle } from './types';

/**
 * Picks up to `count` posts for a "Keep reading" block. Same-category posts
 * come first, taken as the ones *after* this post in list order (wrapping
 * around) so every post gets linked to, not just the newest few. Small
 * categories are topped up with the newest posts from elsewhere.
 */
export function getRelatedPosts(
  article: BlogArticle,
  all: BlogArticle[],
  count = 3,
): BlogArticle[] {
  const sameCategory = all.filter((a) => a.category === article.category);
  const index = sameCategory.findIndex((a) => a.slug === article.slug);
  const following = [...sameCategory.slice(index + 1), ...sameCategory.slice(0, index)];

  const newestElsewhere = all
    .filter((a) => a.category !== article.category)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  return [...following, ...newestElsewhere].slice(0, count);
}
