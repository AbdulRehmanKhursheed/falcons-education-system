'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#programs', label: 'Programs' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#admissions', label: 'Admissions' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-falcon-cream/95 backdrop-blur-sm border-b border-falcon-sand/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-falcon-sageDark text-lg sm:text-xl hover:text-falcon-sage transition-colors tap-target"
          >
            <span className="text-2xl" aria-hidden>🦅</span>
            <span>{SITE_CONFIG.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-falcon-earth hover:bg-falcon-sage/10 hover:text-falcon-sageDark font-medium transition-colors tap-target"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={SITE_CONFIG.whatsapp || `tel:${SITE_CONFIG.phone}` || '#contact'}
              target={SITE_CONFIG.whatsapp ? '_blank' : undefined}
              rel={SITE_CONFIG.whatsapp ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-falcon-sage text-white rounded-full font-semibold hover:bg-falcon-sageDark transition-colors shadow-md tap-target"
            >
              <span>📱</span>
              <span>Enquire Now</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 rounded-lg text-falcon-earth hover:bg-falcon-sand/50 tap-target"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
          aria-hidden={!mobileOpen}
        >
          <nav className="py-4 space-y-1 border-t border-falcon-sand/50" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-falcon-earth hover:bg-falcon-sage/10 font-medium tap-target"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE_CONFIG.whatsapp || `tel:${SITE_CONFIG.phone}` || '#contact'}
              target={SITE_CONFIG.whatsapp ? '_blank' : undefined}
              rel={SITE_CONFIG.whatsapp ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 mx-4 mt-4 px-5 py-3 bg-falcon-sage text-white rounded-full font-semibold justify-center tap-target"
            >
              <span>📱</span>
              <span>Enquire Now</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
