import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, ArrowUpRight, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
  { href: "/faq", label: "FAQ" },
];

const programs = [
  { label: "Nursery (2.5 – 3.5)", href: "/programs#nursery" },
  { label: "Montessori Level (3 – 6)", href: "/programs#montessori" },
  { label: "Kindergarten (4 – 6)", href: "/programs#kg" },
  { label: "Primary (Class 1 – 6)", href: "/programs#class-1-2" },
  { label: "Evening Coaching", href: "/programs#evening-academy" },
  { label: "Saturday Coaching", href: "/programs#saturday-coaching" },
];

/* Brand glyphs — lucide removed brand icons in v1, so we inline minimal marks. */

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ink text-paper/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-10">
        {/* ── Editorial banner row ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-10 pb-14 border-b border-paper/15">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">
              <span
                className="inline-block h-px w-7 bg-accent-soft/60"
                aria-hidden
              />
              Admissions Open · 2026
            </p>
            <h2
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl text-paper leading-[1.05] tracking-[-0.025em]"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Bring your child for a{" "}
              <span
                className="italic text-accent-soft"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                quiet visit
              </span>
              .
            </h2>
            <p className="mt-6 max-w-lg text-paper/70 text-base sm:text-lg">
              We&apos;d rather you see the rooms than read about them. Call
              ahead and we&apos;ll walk you through the classrooms, programs,
              and fee structure.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pl-8 flex flex-col gap-4 lg:items-end justify-end">
            <Link
              href="/admissions"
              className="group inline-flex items-center gap-2 rounded-full bg-paper text-ink px-7 py-4 text-[14px] font-semibold hover:bg-accent hover:text-ink transition-colors"
            >
              Begin application
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.25}
              />
            </Link>
            <a
              href={SITE_CONFIG.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] text-paper/70 hover:text-paper transition-colors underline decoration-paper/30 underline-offset-[6px]"
            >
              Or send a WhatsApp message
            </a>
          </div>
        </div>

        {/* ── Columns ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 py-14">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="Falcons Education System — home"
            >
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                className="shrink-0 object-contain"
              />
              <span className="flex flex-col leading-none">
                <span
                  className="font-display text-xl text-paper tracking-[-0.02em]"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  Falcons
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/50">
                  Education System
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm text-paper/60 leading-relaxed">
              A Montessori-rooted school in Rawalpindi — nursery through Class
              6, plus evening and Saturday coaching. Founded{" "}
              {SITE_CONFIG.founded}.
            </p>

            <div className="mt-6 flex gap-2">
              {[
                {
                  href: SITE_CONFIG.social.instagram,
                  label: "Instagram",
                  Icon: InstagramIcon,
                },
                {
                  href: SITE_CONFIG.social.facebook,
                  label: "Facebook",
                  Icon: FacebookIcon,
                },
                {
                  href: SITE_CONFIG.social.tiktok,
                  label: "TikTok",
                  Icon: TikTokIcon,
                },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-paper/15 text-paper/70 hover:border-paper hover:text-paper transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Site map */}
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 mb-5">
              The school
            </p>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[15px] text-paper/75 hover:text-paper transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 mb-5">
              Programs
            </p>
            <ul className="space-y-3">
              {programs.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[15px] text-paper/75 hover:text-paper transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 mb-5">
              Contact
            </p>
            <address className="not-italic text-[15px] text-paper/75 leading-relaxed">
              <span className="block text-paper">Falcons Education System</span>
              <span className="block mt-1">Street No 14, Sonari Bank</span>
              <span className="block">Kamalabad Road</span>
              <span className="block">Rawalpindi 46000</span>
            </address>

            <div className="mt-5 space-y-2.5 text-[14px]">
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="flex items-center gap-2 text-paper/75 hover:text-paper transition-colors"
              >
                <Phone
                  className="h-3.5 w-3.5 text-accent-soft"
                  strokeWidth={1.75}
                />
                <span className="font-mono tracking-tight">
                  {SITE_CONFIG.phone}
                </span>
              </a>
              <a
                href={`tel:${SITE_CONFIG.phonePTCL}`}
                className="flex items-center gap-2 text-paper/75 hover:text-paper transition-colors"
              >
                <Phone
                  className="h-3.5 w-3.5 text-accent-soft"
                  strokeWidth={1.75}
                />
                <span className="font-mono tracking-tight">
                  {SITE_CONFIG.phonePTCL}
                </span>
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-paper/75 hover:text-paper transition-colors break-all"
              >
                <Mail
                  className="h-3.5 w-3.5 text-accent-soft"
                  strokeWidth={1.75}
                />
                <span>{SITE_CONFIG.email}</span>
              </a>
              <a
                href={SITE_CONFIG.mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-paper/75 hover:text-paper transition-colors"
              >
                <MapPin
                  className="h-3.5 w-3.5 text-accent-soft"
                  strokeWidth={1.75}
                />
                <span>Get directions</span>
              </a>
            </div>

            <div className="mt-6 text-[11px] text-paper/45 leading-relaxed">
              <p className="font-mono uppercase tracking-[0.18em] text-paper/40 mb-1">
                Hours
              </p>
              <p>School · Mon – Fri · 8:00 – 14:00</p>
              <p>Coaching · Mon – Fri · 15:30 – 19:30</p>
              <p>Saturday · 09:00 – 13:00</p>
            </div>
          </div>
        </div>

        {/* ── Baseline ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-paper/15 text-[12px] text-paper/45">
          <p>
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p>
            Made with❤️ by{" "}
            <span className="text-paper/70">Abdul Rehman Khursheed</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
