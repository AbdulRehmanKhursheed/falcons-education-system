import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const NAV = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Journal' },
  { href: '/careers', label: 'Careers' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="tap-target rounded-full border border-line text-ink-muted transition-colors hover:border-brand hover:text-brand"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-warm">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="font-display text-xl font-extrabold text-ink">
                Falcons Education System
              </span>
            </Link>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
              A school in Rawalpindi for children aged 2.5 to 12 — Montessori early years,
              primary school from Class 1 to Class 6 on the national syllabus, plus evening
              &amp; Saturday coaching and computer courses. Small classes, teachers who know
              every child by name.
            </p>
            <div className="mt-5 flex gap-2.5">
              <SocialIcon href={SITE_CONFIG.social.instagram} label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>
              <SocialIcon href={SITE_CONFIG.social.facebook} label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.5 1.6-1.5H16.7V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v7h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href={SITE_CONFIG.social.tiktok} label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6 3c.4 2.1 1.8 3.6 3.9 3.9v3c-1.5 0-2.8-.5-3.9-1.3v6.6c0 3.4-2.7 5.8-6 5.8-3.2 0-5.6-2.4-5.6-5.5 0-3.2 2.6-5.6 6-5.5.3 0 .7 0 1 .1v3.1c-.3-.1-.7-.2-1-.2-1.6 0-2.9 1.2-2.9 2.6 0 1.5 1.2 2.5 2.6 2.5 1.6 0 2.9-1.2 2.9-2.9V3h3z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5" aria-label="Footer">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.9375rem] font-semibold text-ink-soft transition-colors hover:text-brand"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <address className="flex flex-col gap-3 not-italic">
            <a
              href={SITE_CONFIG.mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-brand"
            >
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand" />
              <span>
                Street 14, Sonari Bank, Kamalabad Road,
                <br />
                Near Bakra Mandi, Rawalpindi
              </span>
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-brand"
            >
              <Phone size={18} className="shrink-0 text-brand" />
              {SITE_CONFIG.phone}
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="flex items-center gap-2.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-brand"
            >
              <Mail size={18} className="shrink-0 text-brand" />
              {SITE_CONFIG.email}
            </a>
          </address>
        </div>

        {/* Quiet SEO block — factual, readable, written for parents (and quotable by search & AI assistants) */}
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="text-sm font-extrabold text-ink">
            Looking for a good school in Rawalpindi?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-faint">
            Falcons Education System serves families across Kamalabad Road, Bakra Mandi, Dhoke
            Kashmirian, Sadiqabad and nearby areas of Rawalpindi. Parents choose us for Montessori
            education (ages 2.5–6), primary schooling up to Class 6, and after-school support:
            the Evening Coaching Academy runs Monday–Friday 3:30–7:30 PM and Saturday Coaching
            9 AM–1 PM — open to children from any school. Admissions for Session 2026 are open;
            visit the campus on Street 14, Sonari Bank, Kamalabad Road any working morning, or
            message us on WhatsApp at {SITE_CONFIG.phone}.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Falcons Education System. All rights reserved.</p>
          <p>Admissions open — Session 2026</p>
        </div>
      </div>
    </footer>
  );
}
