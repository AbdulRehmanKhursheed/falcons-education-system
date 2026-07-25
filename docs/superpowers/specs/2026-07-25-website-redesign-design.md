# Website Redesign — Premium-Playful (2026-07-25)

## Problem
The current marketing site reads as AI-generated: Fraunces italic-serif "editorial" styling, numbered eyebrow labels, symmetrical card grids with checkmark lists, cream/gold palette, corner-bracket decorations, no real imagery, and near-static presentation. User verdict: not modern, not attractive, not kid-friendly, no uniqueness. Reference bar: vivo.com/pk product pages (image-led, huge type, one idea per section, scroll-driven).

## Direction (approved)
**Premium-playful.** vivo's cleanliness + the crest's colors.

### Typography
- Headlines: **Bricolage Grotesque** (Google Fonts, via next/font), 72–96px desktop hero scale.
- Body/UI: **Manrope**.
- Banned: italic serifs, numbered eyebrows, letter-spaced smallcap labels.

### Color (from the crest)
- Canvas white `#FFFFFF`, ink navy `#0A1F44`.
- Sky blue (primary accent — buttons, links, highlights).
- Yellow + crimson: small playful pops (underline strokes, chips, hovers).
- Deep navy full-bleed dark sections. Gold retired to the crest artwork only.
- Legacy tokens remain in globals.css so not-yet-redesigned pages keep rendering.

### Scope this round
Homepage + Programs + Admissions, plus shared chrome (Header, Footer, WhatsApp button, MobileActionBar). Remaining pages in a second pass.

### Homepage sections (one idea per section)
1. White glass nav, blur on scroll, sky-blue Apply pill.
2. Hero: 90px headline "Where curious minds take flight.", cinematic full-bleed image (placeholder plate until Gemini images land), parallax, WhatsApp + Visit CTAs.
3. Three program rows (Montessori / Primary / Coaching): big image + short headline, alternating sides. No card grids.
4. Dark navy numbers band with count-up stats.
5. Auto-scrolling gallery marquee (drag to explore).
6. Single large swipeable testimonial.
7. Admissions: 3 steps on a horizontal line → navy WhatsApp CTA band.
8. Compact white footer.

### Programs page
Full-width image-led chapters per level (Nursery → Class 6, coaching, computer courses).

### Admissions page
Timeline of steps, fees/documents as clean tables, sticky WhatsApp CTA.

### Motion
framer-motion scroll reveals everywhere, hero parallax, count-up numbers, marquee, hover lifts, nav blur. Subtle and fast.

### Imagery
~12 Gemini prompts with one locked art direction (photorealistic, warm natural window light, Pakistani classroom context, navy/sky-blue uniforms, 3:2, consistent lens) delivered as `docs/image-prompts.md`. User generates and drops into `public/images/`; soft navy gradient plates as placeholders meanwhile.

### Unchanged
Routes/URLs, SEO metadata + JSON-LD, SITE_CONFIG facts, WhatsApp/phone CTAs, mobile action bar (restyled).

## Success criteria
- Homepage/Programs/Admissions no longer resemble the old template in type, color, or layout.
- Site feels alive (motion on scroll) and kid-friendly while staying credible to parents.
- Build green, all routes 200, mobile layout clean at 390px.
