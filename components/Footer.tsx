import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const navLinks = [
  { href: '/about',       label: 'About Us' },
  { href: '/programs',    label: 'Programs' },
  { href: '/admissions',  label: 'Admissions' },
  { href: '/gallery',     label: 'Gallery' },
  { href: '/blog',        label: 'Blog' },
  { href: '/contact',     label: 'Contact' },
  { href: '/careers',     label: 'Careers' },
  { href: '/faq',         label: 'FAQ' },
];

const programs = [
  { label: 'Nursery (Age 2.5–3.5)',        href: '/programs#nursery' },
  { label: 'Montessori Level (Age 3–6)',   href: '/programs#montessori' },
  { label: 'KG / Kindergarten (Age 4–6)', href: '/programs#kg' },
  { label: 'Saturday Coaching',            href: '/programs#saturday-coaching' },
  { label: 'Evening Academy',             href: '/programs#evening-academy' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-falcon-sageDark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold text-xl mb-4 hover:text-falcon-sageLight transition-colors"
              aria-label="Falcons Education System — home"
            >
              <Image
                src="/logo.png"
                alt="Falcons Education System logo"
                width={44}
                height={44}
                className="shrink-0 object-contain rounded-sm bg-white/10 p-0.5"
              />
              <span>{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Nurturing young minds with Montessori excellence since {SITE_CONFIG.founded}.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-4">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/25 transition-colors tap-target"
                aria-label="Follow on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/25 transition-colors tap-target"
                aria-label="Follow on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/25 transition-colors tap-target"
                aria-label="Follow on TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.11V9.02a6.27 6.27 0 00-.79-.05c-3.45 0-6.25 2.8-6.25 6.25s2.8 6.25 6.25 6.25 6.25-2.8 6.25-6.25V9.76a8.16 8.16 0 004.77 1.52V7.86a4.84 4.84 0 01-1.92-.17z" />
                </svg>
              </a>
              <a
                href={SITE_CONFIG.mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/25 transition-colors tap-target"
                aria-label="Find us on Google Maps"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </a>
            </div>

            <p className="text-white/50 text-xs">
              <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white transition-colors">
                {SITE_CONFIG.email}
              </a>
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">Our Programs</h3>
            <ul className="space-y-2 mb-6">
              {programs.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                School Hours
              </p>
              <p className="text-white/80 text-sm">School: Mon–Fri 8:00 AM – 2:00 PM</p>
              <p className="text-white/80 text-sm">Coaching: Mon–Fri 3:30 PM – 7:30 PM</p>
              <p className="text-white/80 text-sm">Saturday: 9:00 AM – 1:00 PM</p>
              <p className="text-white/50 text-xs mt-1">Sunday: Closed</p>
            </div>
          </div>

          {/* Address + NAP */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">Visit Our School</h3>
            <address className="not-italic text-white/80 text-sm space-y-1 mb-4 leading-relaxed">
              <p className="font-semibold text-white">Falcons Education System</p>
              <p>Street No 14, Sonari Bank</p>
              <p>Kamalabad Road, Near Bakra Mandi</p>
              <p>Rawalpindi, Punjab 46000</p>
              <p>Pakistan</p>
            </address>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="text-white/80 hover:text-white text-sm transition-colors block mb-1"
            >
              📞 {SITE_CONFIG.phone}
            </a>
            <a
              href={`tel:${SITE_CONFIG.phonePTCL}`}
              className="text-white/80 hover:text-white text-sm transition-colors block mb-1"
            >
              ☎️ {SITE_CONFIG.phonePTCL} (PTCL)
            </a>
            <a
              href={SITE_CONFIG.mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
            >
              <span aria-hidden>🗺️</span>
              Get Directions
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/20 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
            <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
            <Link href="/admissions" className="hover:text-white transition-colors underline underline-offset-2">
              Admissions Open 2026
            </Link>
          </div>
          <p className="text-center text-white/30 text-xs mt-4">
            Made with <span className="text-red-400">♥</span> by Abdul Rehman
          </p>
        </div>
      </div>
    </footer>
  );
}
