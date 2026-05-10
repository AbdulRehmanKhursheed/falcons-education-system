import { type ReactNode } from 'react';

type EyebrowProps = {
  children: ReactNode;
  number?: string;
  className?: string;
};

/**
 * Editorial section label. Renders a small-caps eyebrow with a hairline rule
 * and an optional numeric prefix ("01 — Early Years").
 */
export function Eyebrow({ children, number, className = '' }: EyebrowProps) {
  return (
    <p
      className={`inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent ${className}`}
    >
      {number && <span className="font-mono text-ink-faint">{number}</span>}
      <span className="inline-block h-px w-7 bg-accent/60" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
