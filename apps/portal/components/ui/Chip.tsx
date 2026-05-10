import { cn } from '@/lib/cn';

const toneMap = {
  neutral: 'bg-surface-3 text-ink-soft',
  brand:   'bg-brand-soft text-brand-dark',
  accent:  'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warn:    'bg-warn-soft text-warn',
  danger:  'bg-danger-soft text-danger',
  info:    'bg-info-soft text-info',
} as const;

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return <span className={cn('chip', toneMap[tone], className)}>{children}</span>;
}
