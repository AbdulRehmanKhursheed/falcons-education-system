import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const socialCards = [
  {
    platform: 'Instagram',
    handle: '@falconseducationsystem',
    href: SITE_CONFIG.social.instagram,
    description: 'Follow us for classroom moments, activities, and school updates.',
    bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    icon: (
      <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    platform: 'Facebook',
    handle: 'Falcons Education System',
    href: SITE_CONFIG.social.facebook,
    description: 'Like our page for admissions announcements and school news.',
    bgColor: 'bg-[#1877f2]',
    icon: (
      <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    platform: 'Google Maps',
    handle: 'Kamalabad Road, Rawalpindi',
    href: SITE_CONFIG.mapDirectUrl,
    description: 'Find us on Google Maps — directions from anywhere in Rawalpindi.',
    bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
    icon: (
      <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { href: '#about',       label: 'About Us',          icon: '🏫' },
  { href: '#programs',    label: 'Our Programs',       icon: '📚' },
  { href: '#gallery',     label: 'Gallery',            icon: '🖼️' },
  { href: '#admissions',  label: 'Apply / Admissions', icon: '📋' },
  { href: '#contact',     label: 'Visit Us',           icon: '📍' },
  { href: '#faq',         label: 'FAQ',                icon: '❓' },
];

export function SocialLinks() {
  return (
    <section
      id="connect"
      className="py-16 sm:py-20 bg-falcon-cream"
      aria-labelledby="social-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            Stay Connected
          </p>
          <h2
            id="social-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Follow Falcons Education System
          </h2>
          <p className="text-falcon-earth text-lg max-w-xl mx-auto">
            Stay up to date with school news, classroom activities, admissions announcements,
            and events from our Rawalpindi Montessori school.
          </p>
        </div>

        {/* Social cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {socialCards.map(({ platform, handle, href, description, bgColor, icon }) => (
            <a
              key={platform}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden border border-falcon-sand shadow-sm hover:shadow-md transition-all bg-white"
              aria-label={`Follow Falcons Education System on ${platform}`}
            >
              {/* Coloured top band */}
              <div className={`${bgColor} p-5 flex items-center gap-3`}>
                {icon}
                <div>
                  <p className="font-bold text-white text-base">{platform}</p>
                  <p className="text-white/80 text-xs">{handle}</p>
                </div>
                <svg
                  className="w-5 h-5 text-white/70 ml-auto group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="p-4">
                <p className="text-sm text-falcon-earth">{description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Quick internal navigation links */}
        <div className="bg-white rounded-2xl border border-falcon-sand p-6 sm:p-8 shadow-sm">
          <h3 className="font-display font-bold text-falcon-sageDark text-lg mb-5 text-center">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-falcon-cream border border-transparent hover:border-falcon-sand transition-all text-center group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden>
                  {icon}
                </span>
                <span className="text-xs font-semibold text-falcon-earth group-hover:text-falcon-sageDark transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
