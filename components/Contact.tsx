'use client';

import { useState, FormEvent } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn } from '@/components/ui/Motion';
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

interface CallbackForm {
  name: string;
  phone: string;
}

export function Contact() {
  const [form, setForm] = useState<CallbackForm>({ name: '', phone: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hi, I'd like a callback from Falcons Education System.\n\nName: ${form.name}\nPhone: ${form.phone}`
    );
    if (SITE_CONFIG.whatsapp) {
      window.open(`${SITE_CONFIG.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:${SITE_CONFIG.email}?subject=Callback Request&body=${message}`;
    }
    setSent(true);
    setForm({ name: '', phone: '' });
  }

  return (
    <section
      id="contact"
      className="relative bg-paper"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        {/* Section intro */}
        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-16">
          <div className="lg:col-span-7">
            <Eyebrow number="08">Find us</Eyebrow>
            <h2
              id="contact-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Come for a{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                quiet tour
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            We&apos;re on Kamalabad Road, Sonari Bank, near Bakra Mandi. Walk-ins are
            welcome during school hours — no appointment needed for a first visit.
          </p>
        </FadeIn>

        {/* Address + Map */}
        <FadeIn className="grid lg:grid-cols-12 gap-px bg-line border border-line mb-12">

          {/* NAP block */}
          <div className="lg:col-span-5 bg-paper p-8 lg:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              The school
            </p>
            <h3 className="mt-3 font-display text-2xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
              {SITE_CONFIG.name}
            </h3>

            <address className="not-italic mt-5 text-[15px] text-ink-soft leading-[1.7]">
              <p>Street No 14, Sonari Bank</p>
              <p>Kamalabad Road, Near Bakra Mandi</p>
              <p>Rawalpindi, Punjab 46000</p>
              <p>Pakistan</p>
            </address>

            <ul className="mt-8 -mx-2">
              {[
                { href: `tel:${SITE_CONFIG.phone}`,     label: SITE_CONFIG.phone,     meta: 'Call · WhatsApp', Icon: Phone },
                { href: `tel:${SITE_CONFIG.phonePTCL}`, label: SITE_CONFIG.phonePTCL, meta: 'PTCL landline',   Icon: Phone },
                { href: SITE_CONFIG.whatsapp || '#',    label: 'WhatsApp message',    meta: 'Direct chat',     Icon: MessageCircle, external: true },
                { href: `mailto:${SITE_CONFIG.email}`,  label: SITE_CONFIG.email,     meta: 'Email',           Icon: Mail },
              ].map(({ href, label, meta, Icon, external }) => (
                <li key={meta}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center gap-4 py-3.5 px-2 border-b border-line-soft hover:bg-paper-warm transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm tracking-tight text-ink break-all">{label}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint mt-0.5">{meta}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-2">
              {[
                { href: SITE_CONFIG.social.instagram, label: 'Instagram', Icon: InstagramIcon },
                { href: SITE_CONFIG.social.facebook,  label: 'Facebook',  Icon: FacebookIcon  },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink-soft hover:border-ink hover:text-ink transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <a
              href={SITE_CONFIG.mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              Get directions
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </a>
          </div>

          {/* Map */}
          <div className="lg:col-span-7 relative bg-paper-warm aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
            <iframe
              src="https://maps.google.com/maps?q=Street+14+Sonari+Bank+Kamalabad+Road+Rawalpindi+Pakistan&output=embed"
              className="absolute inset-0 w-full h-full grayscale-[20%]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Falcons Education System — location"
            />
            {/* Corner marks */}
            <span aria-hidden className="absolute top-3 left-3 h-5 w-5 border-t border-l border-accent" />
            <span aria-hidden className="absolute top-3 right-3 h-5 w-5 border-t border-r border-accent" />
            <span aria-hidden className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-accent" />
            <span aria-hidden className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-accent" />
          </div>
        </FadeIn>

        {/* Callback request */}
        <FadeIn className="border border-line bg-ink text-paper">
          <div className="grid lg:grid-cols-2 gap-px">
            <div className="bg-ink p-8 sm:p-10">
              <Eyebrow className="text-accent-soft">Prefer we call you</Eyebrow>
              <h3 className="mt-5 font-display text-3xl text-paper" style={{ fontVariationSettings: '"opsz" 48' }}>
                Request a callback.
              </h3>
              <p className="mt-3 text-paper/70 text-[14.5px] leading-[1.65] max-w-md">
                Leave your number and we&apos;ll call you back within one school day —
                usually sooner.
              </p>
            </div>

            <div className="bg-ink p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-paper/15">
              {sent ? (
                <div className="py-6">
                  <CheckCircle2 className="h-7 w-7 text-accent-soft" strokeWidth={1.5} />
                  <p className="mt-5 font-display text-2xl text-paper" style={{ fontVariationSettings: '"opsz" 24' }}>
                    Request received
                  </p>
                  <p className="mt-2 text-paper/70 text-sm">We&apos;ll be in touch shortly.</p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-paper underline decoration-paper/30 decoration-1 underline-offset-[6px] hover:text-accent-soft hover:decoration-accent-soft transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="cb-name" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/50 mb-2">
                      Your name
                    </label>
                    <input
                      id="cb-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full px-4 py-3.5 rounded-md bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-phone" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/50 mb-2">
                      Phone · WhatsApp
                    </label>
                    <input
                      id="cb-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+92 3XX XXXXXXX"
                      className="w-full px-4 py-3.5 rounded-md bg-paper/5 border border-paper/15 text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-paper text-ink px-6 py-3.5 text-[14px] font-semibold hover:bg-accent-soft transition-colors"
                  >
                    Request callback
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
