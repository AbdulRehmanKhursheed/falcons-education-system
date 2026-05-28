import { cn } from '@/lib/cn';

function initials(name: string | null | undefined): string {
  if (!name) return '';
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

type AvatarProps = {
  /** Display name. Used for initials AND as alt text. */
  name: string | null | undefined;
  /** Optional uploaded profile photo. Takes precedence over initials. */
  imageUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
};

/**
 * Avatar precedence:
 *   1. Uploaded photo (imageUrl) — preferred when present.
 *   2. Initials from `name` — default for every real user.
 *   3. Illustrated SVG silhouette — last-resort fallback when there is no
 *      photo AND no usable name (e.g., service accounts, half-migrated rows).
 *
 * The illustration is intentionally minimal — a brand-tinted person silhouette
 * — so it reads as "person without a profile yet" rather than competing with
 * real headshots once we ship uploads.
 */
export function Avatar({ name, imageUrl, size = 'sm', className }: AvatarProps) {
  const wrapperClass = cn(
    'inline-flex items-center justify-center rounded-full overflow-hidden shrink-0',
    sizeMap[size],
    className,
  );

  if (imageUrl) {
    return (
      <span className={wrapperClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name ?? 'Avatar'}
          width={48}
          height={48}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  const init = initials(name);
  if (init) {
    return (
      <span
        className={cn(
          wrapperClass,
          'bg-ink text-paper font-semibold uppercase tracking-wider',
        )}
        aria-hidden
      >
        {init}
      </span>
    );
  }

  return <SilhouetteFallback className={wrapperClass} ariaLabel={name ?? 'User'} />;
}

function SilhouetteFallback({
  className,
  ariaLabel,
}: {
  className: string;
  ariaLabel: string;
}) {
  return (
    <span className={cn(className, 'bg-accent-soft/40 ring-1 ring-line')} role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden focusable="false">
        <defs>
          <linearGradient id="falconsAvatarBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F3EEE3" />
            <stop offset="1" stopColor="#E8D599" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#falconsAvatarBg)" />
        {/* shoulders */}
        <path d="M6 46c2.6-7.6 9.2-12 18-12s15.4 4.4 18 12v2H6v-2z" fill="#163A75" />
        {/* head */}
        <circle cx="24" cy="20" r="8.5" fill="#163A75" />
        {/* gold neckline accent — echoes the laurel banner */}
        <path
          d="M16.5 36.5c2 2.2 4.6 3.3 7.5 3.3s5.5-1.1 7.5-3.3"
          fill="none"
          stroke="#C9A03B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
