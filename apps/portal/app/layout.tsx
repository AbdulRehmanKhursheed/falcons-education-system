import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://portal.falconseducationsystem.com'),
  title: {
    default: 'Falcons Education System — School Portal',
    template: '%s · Falcons Education System',
  },
  description:
    'The internal school portal for Falcons Education System, Rawalpindi — admissions, attendance, fees, assessments, and parent communication in one place.',
  applicationName: 'Falcons Education System',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Falcons Education System — School Portal',
    description: 'Internal staff & parent portal for Falcons Education System, Rawalpindi.',
    siteName: 'Falcons Education System',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
