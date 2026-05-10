import { type ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="eyebrow text-accent mb-3">{eyebrow}</p>
        )}
        <h1
          className="font-display text-[2rem] sm:text-[2.5rem] leading-[1.05] text-ink"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-[14.5px] text-ink-soft leading-[1.6] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
