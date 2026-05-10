'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-paper/85 backdrop-blur-md border-b border-line shadow-paper'
          : 'bg-paper/0 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Wordmark ────────────────────────────────────────────── */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center gap-3 min-w-0"
            aria-label="Falcons Education System — home"
          >
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="shrink-0 object-contain"
              priority
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg sm:text-[1.35rem] text-ink tracking-[-0.02em] group-hover:text-brand transition-colors" style={{ fontVariationSettings: '"opsz" 24' }}>
                Falcons
              </span>
              <span className="hidden sm:block mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                Education System
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-[13.5px] font-medium text-ink-soft hover:text-ink transition-colors after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-0.5 after:h-px after:bg-ink after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <span>Enquire</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
            </a>
          </div>

          {/* ── Mobile toggle ──────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-ink hover:bg-line-soft transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-paper border-b border-line shadow-card transition-all duration-300 origin-top ${
          mobileOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-baseline justify-between gap-3 py-4 border-b border-line-soft last:border-b-0 text-ink hover:text-brand transition-colors"
            >
              <span className="font-display text-2xl" style={{ fontVariationSettings: '"opsz" 24' }}>
                {link.label}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
            </Link>
          ))}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-full bg-ink text-paper text-[13px] font-semibold"
            >
              Enquire
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </a>
            <Link
              href="/admissions"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-full border border-ink text-ink text-[13px] font-semibold"
            >
              Apply
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
