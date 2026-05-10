import { Construction } from 'lucide-react';
import { type ReactNode } from 'react';

export function ComingSoon({
  module,
  description,
  bullets,
}: {
  module: string;
  description: ReactNode;
  bullets: string[];
}) {
  return (
    <div className="relative">
      {/* Corner marks */}
      <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent" />
      <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent" />
      <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent" />
      <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent" />

      <div className="border border-line bg-surface rounded-md px-8 py-16 sm:px-12 sm:py-20 text-center">
        <Construction className="w-7 h-7 mx-auto text-accent" strokeWidth={1.25} />

        <p className="mt-6 eyebrow text-ink-faint">{module} · Phase 2</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
          Coming next.
        </h2>
        <p className="mt-4 max-w-md mx-auto text-[14px] text-ink-soft leading-[1.65]">
          {description}
        </p>

        <ul className="mt-8 max-w-md mx-auto space-y-2 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[13.5px] text-ink-soft">
              <span aria-hidden className="mt-2 inline-block h-1 w-3 bg-accent shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
