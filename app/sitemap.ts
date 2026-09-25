import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { blogArticles } from '@/lib/blog-data';

const BASE = SITE_CONFIG.url;

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified on static pages: stamping them with the build time on every
  // deploy makes Google distrust (and ignore) lastmod for the whole sitemap.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/coaching`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/syllabus`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/admissions`, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/gallery`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/careers`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${BASE}/blog/${article.slug}`,
    lastModified: new Date(article.publishedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
