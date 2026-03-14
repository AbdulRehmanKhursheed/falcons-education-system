import type { Metadata, Viewport } from 'next';
import { Nunito, Quicksand } from 'next/font/google';
import './globals.css';
import { organizationSchema, websiteSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { SITE_CONFIG, SEO_KEYWORDS } from '@/lib/constants';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: 'Falcons Education System | School Nursery to Class 6 — Rawalpindi',
    template: '%s | Falcons Education System',
  },
  description: SITE_CONFIG.description,
  keywords: SEO_KEYWORDS,
  authors: [{ name: 'Falcons Education System', url: SITE_CONFIG.url }],
  creator: 'Falcons Education System',
  publisher: 'Falcons Education System',
  formatDetection: { email: false, address: false, telephone: false },

  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: 'Falcons Education System | School Nursery to Class 6 — Rawalpindi',
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Falcons Education System — School Nursery to Class 6 & Evening Coaching in Rawalpindi',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Falcons Education System | School Nursery to Class 6 Rawalpindi',
    description: SITE_CONFIG.description,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },

  alternates: {
    canonical: SITE_CONFIG.url,
  },

  // Geo meta tags for local search ranking
  other: {
    'geo.region': 'PK-PB',
    'geo.placename': 'Rawalpindi, Punjab, Pakistan',
    'geo.position': `${SITE_CONFIG.coordinates.lat};${SITE_CONFIG.coordinates.lng}`,
    'ICBM': `${SITE_CONFIG.coordinates.lat}, ${SITE_CONFIG.coordinates.lng}`,
    'DC.title': 'Falcons Education System',
    'DC.subject': 'Montessori School, Preschool, Early Childhood Education',
    'DC.coverage': 'Rawalpindi, Punjab, Pakistan',
  },

  category: 'education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#00a3fe',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [organizationSchema, websiteSchema, breadcrumbSchema, faqSchema];

  return (
    <html lang="en-PK" className={`${nunito.variable} ${quicksand.variable}`}>
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-body min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileActionBar />
      </body>
    </html>
  );
}
