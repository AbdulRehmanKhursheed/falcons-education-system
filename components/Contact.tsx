'use client';

import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { trackLead } from '@/components/MetaPixel';

const HOURS = [
  { label: 'School (P.G – Class 6)', value: 'Mon – Thu & Sat · 8:00 AM – 2:00 PM' },
  { label: 'School (Play Group - Class 6)', value: 'Friday · 8:00 AM – 12:30 PM' },

  { label: 'Evening Coaching (P.G – Matric)', value: 'Mon – Sat · 3:30 – 7:00 PM' },
  { label: 'Sunday', value: 'Closed' },
];

export function Contact() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+enquire+about+admissions+at+Falcons+Education+System.`;

  const methods = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: SITE_CONFIG.phone,
      href: waHref,
      external: true,
      onClick: () => trackLead('contact-page-whatsapp'),
    },
    {
      icon: Phone,
      label: 'Call',
      value: `${SITE_CONFIG.phone} · ${SITE_CONFIG.phonePTCL}`,
      href: `tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: SITE_CONFIG.email,
      href: `mailto:${SITE_CONFIG.email}`,
    },
    {
      icon: MapPin,
      label: 'Visit',
      value: SITE_CONFIG.address.full,
      href: SITE_CONFIG.mapDirectUrl,
      external: true,
    },
  ];

  return (
    <section className="bg-paper py-14 md:py-20" aria-label="Contact details">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:gap-14 md:px-8">
        <div>
          <Stagger className="grid gap-4" gap={0.06}>
            {methods.map((m) => (
              <StaggerItem key={m.label}>
                <a
                  href={m.href}
                  onClick={m.onClick}
                  {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-paper transition-all hover:-translate-y-0.5 hover:border-brand-tint hover:shadow-card"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <m.icon size={20} />
                  </div>
                  <div>
                    <p className="font-extrabold text-ink">{m.label}</p>
                    <p className="mt-0.5 text-[0.9375rem] leading-snug text-ink-muted group-hover:text-ink-soft">
                      {m.value}
                    </p>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn delay={0.15}>
            <div className="mt-6 rounded-2xl bg-paper-warm p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                <Clock size={19} className="text-brand" />
                Timings
              </h2>
              <dl className="mt-4 flex flex-col gap-2.5">
                {HOURS.map((h) => (
                  <div key={h.label} className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
                    <dt className="font-semibold text-ink-soft">{h.label}</dt>
                    <dd className="text-right text-ink-muted">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.1} className="min-h-[320px]">
          <div className="h-full overflow-hidden rounded-3xl border border-line shadow-card">
            <iframe
              src={SITE_CONFIG.mapEmbedUrl}
              title="Falcons Education System location on Google Maps"
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
