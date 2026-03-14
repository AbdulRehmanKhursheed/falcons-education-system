'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/careers', label: 'Careers' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const ctaHref = SITE_CONFIG.whatsapp || (SITE_CONFIG.phone ? `tel:${SITE_CONFIG.phone}` : '/admissions');
  const ctaTarget = SITE_CONFIG.whatsapp ? '_blank' : undefined;
  const ctaRel = SITE_CONFIG.whatsapp ? 'noopener noreferrer' : undefined;

  return (
    <header
      ref={menuRef}
      className={`sticky top-0 z-50 bg-falcon-cream/95 backdrop-blur-sm border-b border-falcon-sand/50 transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 font-display font-bold text-falcon-sageDark hover:text-falcon-sage transition-colors min-w-0"
            aria-label="Falcons Education System — home"
          >
            <Image
              src="/logo.png"
              alt="Falcons Education System logo"
              width={40}
              height={40}
              className="shrink-0 object-contain"
              priority
            />
            <span className="hidden xs:block sm:block text-base sm:text-xl leading-tight">
              {SITE_CONFIG.name}
            </span>
            <span className="block xs:hidden text-base leading-tight">
              Falcons Education
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-falcon-earth hover:bg-falcon-sage/10 hover:text-falcon-sageDark font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-falcon-sage text-white rounded-full text-sm font-bold hover:bg-falcon-sageDark transition-colors shadow-md"
            >
              <span aria-hidden>📱</span>
              <span>Enquire Now</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-falcon-earth hover:bg-falcon-sand/50 active:bg-falcon-sand transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-falcon-cream/98 backdrop-blur-sm border-b border-falcon-sand/60 shadow-xl transition-all duration-300 origin-top ${
          mobileOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 py-3 space-y-0.5" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-falcon-earth hover:bg-falcon-sage/10 hover:text-falcon-sageDark font-medium transition-colors text-base active:bg-falcon-sage/20"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 pb-1 grid grid-cols-2 gap-3">
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 bg-falcon-sage text-white rounded-xl font-bold text-sm hover:bg-falcon-sageDark transition-colors shadow-sm active:scale-95"
            >
              <span aria-hidden>📱</span>
              <span>Enquire</span>
            </a>
            <Link
              href="/admissions"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 bg-falcon-sageDark text-white rounded-xl font-bold text-sm hover:opacity-90 transition-colors shadow-sm active:scale-95"
            >
              <span aria-hidden>🎓</span>
              <span>Apply Now</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
