import { cn } from '@/lib/cn';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[12px]',
  lg: 'h-12 w-12 text-sm',
} as const;

export function Avatar({
  name,
  size = 'sm',
  className,
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-ink text-paper font-semibold uppercase tracking-wider shrink-0',
        sizeMap[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
