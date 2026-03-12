import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const navLinks = [
  { href: '#about', label: 'About Us' },
  { href: '#programs', label: 'Programs' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#admissions', label: 'Admissions' },
  { href: '#contact', label: 'Contact' },
  { href: '#faq', label: 'FAQ' },
];

const programs = [
  'Nursery (Age 2.5–3.5)',
  'Montessori Level (Age 3–6)',
  'KG / Kindergarten (Age 4–6)',
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-falcon-sageDark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-4 hover:text-falcon-sageLight transition-colors">
              <span aria-hidden>🦅</span>
              <span>{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Rawalpindi&apos;s trusted Montessori preschool — nurturing young minds with
              child-centered learning since {SITE_CONFIG.founded}.
            </p>
            <div className="flex gap-3">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors tap-target"
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
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors tap-target"
                aria-label="Follow on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
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
            <ul className="space-y-2">
              {programs.map((p) => (
                <li key={p}>
                  <Link href="#programs" className="text-white/80 hover:text-white text-sm transition-colors">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                School Hours
              </p>
              <p className="text-white/80 text-sm">Mon – Fri: 8:00 AM – 2:00 PM</p>
            </div>
          </div>

          {/* Address / Contact */}
          <div>
            <h3 className="font-display font-semibold text-base mb-4">Visit Us</h3>
            <address className="not-italic text-white/80 text-sm space-y-2 mb-4">
              <p>{SITE_CONFIG.address.street}</p>
              <p>{SITE_CONFIG.address.landmark}</p>
              <p>{SITE_CONFIG.address.city}, {SITE_CONFIG.address.postalCode}</p>
              <p>{SITE_CONFIG.address.country}</p>
            </address>
            {SITE_CONFIG.phone && (
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="text-white/80 hover:text-white text-sm transition-colors block mb-1"
              >
                📞 {SITE_CONFIG.phone}
              </a>
            )}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="text-white/80 hover:text-white text-sm transition-colors block"
            >
              ✉️ {SITE_CONFIG.email}
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
          <p>
            Best Montessori School in Rawalpindi •{' '}
            <Link href="#admissions" className="hover:text-white transition-colors">
              Admissions Open
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
