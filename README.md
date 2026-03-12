# Falcons Education System

Official website for **Falcons Education System** — a Montessori preschool in Rawalpindi, Pakistan.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SEO**: JSON-LD (Preschool, EducationalOrganization, LocalBusiness, FAQPage, WebSite, BreadcrumbList)
- **Mobile-first** responsive design

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

```bash
npm run build
npm start
```

**Deploy to Vercel** (recommended, free):
1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Deploy — done!

## Customization

### Add Contact Numbers
Edit `lib/constants.ts`:
- `whatsapp`: e.g. `https://wa.me/923001234567`
- `phone`: e.g. `+92 300 1234567`

### Add Images & Videos
Replace placeholders in:
- **Hero**: `components/Hero.tsx` — hero image/video
- **About**: `components/About.tsx` — school/campus photo
- **Gallery**: `components/Gallery.tsx` — 6 gallery images + 1 video

Use Next.js `Image` component for optimized loading:
```tsx
import Image from 'next/image';
<Image src="/hero.jpg" alt="..." width={1200} height={630} />
```

### Add Logo & OG Image
- Place `logo.png` in `public/`
- Place `og-image.jpg` (1200×630) in `public/` for social sharing
- Place `icon-192.png` and `icon-512.png` for PWA

### Update Domain
Edit `lib/constants.ts` → `url` when you have your domain.

## SEO Features

- ✅ JSON-LD: Preschool, EducationalOrganization, LocalBusiness
- ✅ FAQPage schema for rich snippets
- ✅ WebSite + BreadcrumbList
- ✅ Meta tags, Open Graph, Twitter Cards
- ✅ Sitemap (`/sitemap.xml`)
- ✅ robots.txt
- ✅ PWA manifest

## Keywords Targeted

Montessori school Rawalpindi, best Montessori school Rawalpindi, Montessori preschool Rawalpindi, early childhood education Rawalpindi, Falcons Education System, Montessori admission open, Kamalabad school, Sonari school.

---

© Falcons Education System. Built with care for young learners.
