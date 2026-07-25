import Image from 'next/image';

/**
 * Image slot. Renders a real photo when `src` is provided; until then a
 * designed placeholder plate in crest colors so layouts read finished.
 * Drop generated images into public/images/ and pass their paths.
 */
const PLATES = {
  sky: {
    bg: 'radial-gradient(120% 100% at 15% 0%, #D9F1FC 0%, transparent 55%), radial-gradient(120% 120% at 100% 100%, #A9DDF7 0%, transparent 60%), linear-gradient(150deg, #EAF6FD 0%, #FFFFFF 70%)',
    line: '#0A1F44',
    dark: false,
  },
  sun: {
    bg: 'radial-gradient(120% 100% at 10% 0%, #FFF1C9 0%, transparent 55%), radial-gradient(130% 120% at 100% 100%, #FFDE8A 0%, transparent 60%), linear-gradient(150deg, #FFF6DF 0%, #FFFFFF 70%)',
    line: '#0A1F44',
    dark: false,
  },
  navy: {
    bg: 'radial-gradient(120% 100% at 15% 0%, #1C3A6E 0%, transparent 60%), radial-gradient(130% 120% at 100% 100%, #0E2A57 0%, transparent 65%), linear-gradient(150deg, #12294F 0%, #081A38 70%)',
    line: '#5BC2F0',
    dark: true,
  },
} as const;

type PhotoProps = {
  src?: string;
  alt: string;
  label?: string;
  tone?: keyof typeof PLATES;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Photo({
  src,
  alt,
  label,
  tone = 'sky',
  className = '',
  sizes = '100vw',
  priority = false,
}: PhotoProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  const plate = PLATES[tone];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: plate.bg }}
      role="img"
      aria-label={alt}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* rising sun */}
        <circle cx="640" cy="150" r="90" fill="#FFC53D" fillOpacity={plate.dark ? 0.85 : 0.9} />
        <circle cx="640" cy="150" r="130" stroke="#FFC53D" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="2 10" />
        {/* rolling ground */}
        <path
          d="M-20 520 C 160 430, 340 470, 480 440 S 760 380, 830 420 L 830 620 L -20 620 Z"
          fill={plate.dark ? '#1CA7E8' : '#A9DDF7'}
          fillOpacity={plate.dark ? 0.25 : 0.45}
        />
        <path
          d="M-20 560 C 200 480, 420 520, 620 480 S 800 450, 840 470 L 840 620 L -20 620 Z"
          fill={plate.dark ? '#0E7FBF' : '#1CA7E8'}
          fillOpacity={plate.dark ? 0.35 : 0.35}
        />
        {/* falcon flight line */}
        <path
          d="M-40 380 C 180 300, 320 150, 520 190 S 760 90, 860 50"
          stroke={plate.line}
          strokeOpacity={plate.dark ? 0.6 : 0.3}
          strokeWidth="2.5"
          strokeDasharray="2 11"
          strokeLinecap="round"
        />
        {/* falcon silhouette (simple bird marks) */}
        <path d="M505 185 q 10 -12 22 0 M527 185 q 10 -12 22 0" stroke={plate.dark ? '#FFFFFF' : '#0A1F44'} strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M300 260 q 8 -9 17 0 M317 260 q 8 -9 17 0" stroke={plate.dark ? '#FFFFFF' : '#0A1F44'} strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* playful dots */}
        <circle cx="180" cy="330" r="5" fill="#E4405F" fillOpacity="0.55" />
        <circle cx="700" cy="330" r="6" fill="#1CA7E8" fillOpacity="0.6" />
      </svg>
      {label && (
        <span
          className={`absolute bottom-4 left-5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm ${
            plate.dark ? 'bg-white/10 text-white/75' : 'bg-white/60 text-ink/60'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
