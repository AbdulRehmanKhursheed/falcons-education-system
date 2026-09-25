import type { ReactNode } from 'react';

type HeroRevealProps = {
  children: ReactNode;
  /** Seconds before the entrance starts — same unit as FadeIn's delay. */
  delay?: number;
  className?: string;
};

/**
 * Entrance animation for above-the-fold content. Pure CSS (no JavaScript),
 * so page headings show on first paint instead of after hydration — faster
 * LCP on slow phones. Use FadeIn for content further down the page.
 */
export function HeroReveal({ children, delay = 0, className }: HeroRevealProps) {
  return (
    <div
      className={className ? `hero-rise ${className}` : 'hero-rise'}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
