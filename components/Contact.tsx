'use client';

import { useState, FormEvent } from 'react';
import { SITE_CONFIG } from '@/lib/constants';

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
      className="py-16 sm:py-24 bg-white"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            Find Us
          </p>
          <h2
            id="contact-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Visit Falcons Education System
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            We&apos;d love to meet you and your child. Come for a campus tour — no appointment
            needed during school hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-10">
          {/* Left: NAP + social + callback form */}
          <div className="space-y-6">
            {/* NAP card */}
            <div className="bg-falcon-cream rounded-2xl p-6 sm:p-8 shadow-sm border border-falcon-sand/40">
              <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-1">
                {SITE_CONFIG.name}
              </h3>
              <p className="text-sm text-falcon-sage font-medium mb-4">
                Montessori Preschool, Rawalpindi
              </p>

              <address className="not-italic text-falcon-earth space-y-1 mb-6 text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5">📍</span>
                  <span>{SITE_CONFIG.address.full}</span>
                </p>
              </address>

              <div className="space-y-3">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-3 text-falcon-earth hover:text-falcon-sage transition-colors tap-target text-sm"
                >
                  <span className="text-xl" aria-hidden>📞</span>
                  <span>{SITE_CONFIG.phone} (Call / WhatsApp)</span>
                </a>
                <a
                  href={`tel:${SITE_CONFIG.phonePTCL}`}
                  className="flex items-center gap-3 text-falcon-earth hover:text-falcon-sage transition-colors tap-target text-sm"
                >
                  <span className="text-xl" aria-hidden>☎️</span>
                  <span>{SITE_CONFIG.phonePTCL} (PTCL)</span>
                </a>
                {SITE_CONFIG.whatsapp && (
                  <a
                    href={SITE_CONFIG.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-falcon-earth hover:text-falcon-sage transition-colors tap-target text-sm"
                  >
                    <span className="text-xl" aria-hidden>💬</span>
                    <span>WhatsApp Us</span>
                  </a>
                )}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 text-falcon-earth hover:text-falcon-sage transition-colors tap-target text-sm"
                >
                  <span className="text-xl" aria-hidden>✉️</span>
                  <span>{SITE_CONFIG.email}</span>
                </a>
              </div>

              <div className="flex gap-3 mt-6">
                <a
                  href={SITE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-falcon-sage/10 rounded-full hover:bg-falcon-sage/20 transition-colors tap-target"
                  aria-label="Follow on Instagram"
                >
                  <svg className="w-5 h-5 text-falcon-sageDark" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={SITE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-falcon-sage/10 rounded-full hover:bg-falcon-sage/20 transition-colors tap-target"
                  aria-label="Follow on Facebook"
                >
                  <svg className="w-5 h-5 text-falcon-sageDark" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              <a
                href={SITE_CONFIG.mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-falcon-sage text-white rounded-xl font-semibold text-sm hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
              >
                <span aria-hidden>🗺️</span>
                <span>Get Directions</span>
              </a>
            </div>

            {/* Callback form */}
            <div className="bg-falcon-sageDark text-white rounded-2xl p-6 sm:p-8">
              <h3 className="font-display font-bold text-xl mb-2">Request a Callback</h3>
              <p className="text-white/70 text-sm mb-5">
                Leave your number and we&apos;ll call you back within one school day.
              </p>

              {sent ? (
                <div className="text-center py-6">
                  <span className="text-4xl mb-3 block" aria-hidden>✅</span>
                  <p className="font-semibold text-white mb-1">Request Sent!</p>
                  <p className="text-white/70 text-sm">We&apos;ll be in touch soon.</p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-falcon-sageDark rounded-xl font-bold hover:bg-falcon-cream transition-all shadow-sm tap-target"
                  >
                    📞 Request Callback
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Google Maps embed */}
          <div className="rounded-2xl overflow-hidden border-2 border-falcon-sand/50 shadow-sm h-[350px] sm:h-[450px] lg:h-full min-h-[350px]">
            <iframe
              src="https://maps.google.com/maps?q=Street+14+Sonari+Bank+Kamalabad+Road+Rawalpindi+Pakistan&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Falcons Education System location — Street 14, Sonari Bank, Kamalabad Road, Rawalpindi"
            />
          </div>
        </div>

        {/* Mobile call button */}
        {SITE_CONFIG.phone && (
          <div className="sm:hidden text-center">
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-falcon-sage text-white rounded-2xl font-bold text-lg shadow-md tap-target"
            >
              <span aria-hidden>📞</span>
              <span>Call Now</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
