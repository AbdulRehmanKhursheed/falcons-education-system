import Link from 'next/link';
import {
  ArrowUpRight,
  MapPin,
  BookOpenText,
  GraduationCap,
  Image as ImageIconLucide,
  Phone,
  HelpCircle,
  Newspaper,
  Briefcase,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

type SocialCard = {
  platform: string;
  handle: string;
  href: string;
  description: string;
  Icon: ({ className }: { className?: string }) => React.ReactElement;
};

const socialCards: SocialCard[] = [
  {
    platform: 'Instagram',
    handle: '@falconseducationsystem',
    href: SITE_CONFIG.social.instagram,
    description: 'Classroom moments, activities, and school news.',
    Icon: InstagramIcon,
  },
  {
    platform: 'Facebook',
    handle: 'Falcons Education System',
    href: SITE_CONFIG.social.facebook,
    description: 'Admissions announcements and longer updates.',
    Icon: FacebookIcon,
  },
  {
    platform: 'TikTok',
    handle: '@falconseducationsystem',
    href: SITE_CONFIG.social.tiktok,
    description: 'Short clips of classrooms and school highlights.',
    Icon: TikTokIcon,
  },
  {
    platform: 'Google Maps',
    handle: 'Kamalabad Road, Rawalpindi',
    href: SITE_CONFIG.mapDirectUrl,
    description: 'Directions from anywhere in Rawalpindi.',
    Icon: ({ className }: { className?: string }) => <MapPin className={className} strokeWidth={1.5} />,
  },
];

const quickLinks: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: '/about',       label: 'About',     Icon: Building2 },
  { href: '/programs',    label: 'Programs',  Icon: BookOpenText },
  { href: '/gallery',     label: 'Gallery',   Icon: ImageIconLucide },
  { href: '/admissions',  label: 'Admissions', Icon: GraduationCap },
  { href: '/contact',     label: 'Visit',     Icon: Phone },
  { href: '/faq',         label: 'FAQ',       Icon: HelpCircle },
  { href: '/blog',        label: 'Journal',   Icon: Newspaper },
  { href: '/careers',     label: 'Careers',   Icon: Briefcase },
];

export function SocialLinks() {
  return (
    <section
      id="connect"
      className="relative bg-paper-warm/40"
      aria-labelledby="social-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Eyebrow number="10">Stay in touch</Eyebrow>
            <h2
              id="social-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Follow along, or simply{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                stop by
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            We post regularly on social channels and keep the campus open to visitors
            during school hours.
          </p>
        </FadeIn>

        {/* Social cards */}
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mb-14">
          {socialCards.map(({ platform, handle, href, description, Icon }) => (
            <StaggerItem key={platform} className="bg-paper">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full p-7 lg:p-8 hover:bg-paper-warm transition-colors"
                aria-label={`${platform} · ${handle}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon className="h-6 w-6 text-accent" />
                  <ArrowUpRight className="h-4 w-4 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                </div>

                <p className="font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                  {platform}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-tight text-ink-muted break-all">
                  {handle}
                </p>
                <p className="mt-4 text-[13.5px] text-ink-soft leading-[1.6]">
                  {description}
                </p>
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Quick links */}
        <FadeIn>
          <div className="border-t border-line pt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-6">
              The school · index
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-line border border-line">
              {quickLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col items-center gap-3 py-7 px-3 bg-paper hover:bg-paper-warm transition-colors text-center"
                >
                  <Icon className="h-5 w-5 text-ink-soft group-hover:text-accent transition-colors" strokeWidth={1.5} />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink group-hover:text-brand transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
