import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

// AI assistant crawlers are explicitly welcomed — being quotable in
// ChatGPT/Claude/Perplexity answers is free local marketing.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
