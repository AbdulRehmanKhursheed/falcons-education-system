import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  as: As = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <As className={cn('bg-surface border border-line rounded-lg', className)}>
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  meta,
  eyebrow,
  action,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 py-4 border-b border-line-soft', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow text-ink-faint">{eyebrow}</p>}
        <h3 className="font-display text-lg text-ink leading-tight" style={{ fontVariationSettings: '"opsz" 24' }}>
          {title}
        </h3>
        {meta && <p className="text-[12px] text-ink-muted mt-1">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
