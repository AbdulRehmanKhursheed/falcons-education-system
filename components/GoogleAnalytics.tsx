'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** The contact method a link opens — 'whatsapp', 'phone', or null for any other link. */
function contactMethod(href: string): 'whatsapp' | 'phone' | null {
  if (href.startsWith('https://wa.me/')) return 'whatsapp';
  if (href.startsWith('tel:')) return 'phone';
  return null;
}

/**
 * Google Analytics 4 — renders nothing until NEXT_PUBLIC_GA_ID is set.
 * Every WhatsApp or phone link tap anywhere on the site is sent as a
 * `generate_lead` event, so GA4 can show which pages bring enquiries.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const reportContactClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href]');
      const method = link ? contactMethod(link.getAttribute('href') ?? '') : null;
      if (method) window.gtag?.('event', 'generate_lead', { method });
    };
    document.addEventListener('click', reportContactClick);
    return () => document.removeEventListener('click', reportContactClick);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
