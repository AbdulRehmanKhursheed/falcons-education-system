/**
 * JSON-LD Structured Data — Falcons Education System
 */

import { FAQ_ITEMS } from "./faq-data";

const BASE_URL = "https://falconseducationsystem.com";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["School", "EducationalOrganization", "LocalBusiness"],
  "@id": `${BASE_URL}/#organization`,
  name: "Falcons Education System",
  description:
    "Falcons Education System is a school in Rawalpindi offering education from Play Group to Class 6, plus an Evening Coaching Academy (Mon–Sat, 3:30–7:00 PM) for Play Group to Matric, Spoken English, and Computer Courses for kids.",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/opengraph-image`,
  foundingDate: "2024-08-01",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi",
    addressLocality: "Rawalpindi",
    addressRegion: "Punjab",
    postalCode: "46000",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.57489,
    longitude: 73.03198,
  },
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=Street+14+Sonari+Bank+Kamalabad+Road+Rawalpindi+Pakistan",
  telephone: "+92-311-9911288",
  email: "falconseducationsystem@gmail.com",
  sameAs: [
    "https://www.instagram.com/falconseducationsystem/",
    "https://www.facebook.com/falconseducationsystem/",
    "https://www.tiktok.com/@falconseducationsystem",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
      opens: "08:00",
      closes: "14:00",
      description: "Regular school hours",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:00",
      closes: "12:30",
      description: "Friday half day",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "15:30",
      closes: "19:00",
      description: "Evening Coaching Academy — Play Group to Matric",
    },
  ],
  areaServed: [
    {
      "@type": "City",
      name: "Rawalpindi",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Punjab, Pakistan",
      },
    },
    { "@type": "Place", name: "Kamalabad Road, Rawalpindi" },
    { "@type": "Place", name: "Bakra Mandi, Rawalpindi" },
    { "@type": "Place", name: "Dhoke Kashmirian, Rawalpindi" },
    { "@type": "Place", name: "Sadiqabad, Rawalpindi" },
  ],
  slogan: "Where curious minds take flight",
  knowsAbout: [
    "Montessori education",
    "Early childhood education",
    "Primary school education (Class 1–6)",
    "Evening coaching (Play Group to Matric)",
    "Spoken English for children",
    "Computer courses for children",
  ],
  // No `review` markup on purpose: Google treats testimonials a business
  // publishes about itself as self-serving and never shows stars for them.
  // Real star ratings come from Google Business Profile reviews.
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Programs & Courses",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Play Group",
          description:
            "Montessori Play Group — a child's gentle first step into school, from age 3",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Nursery",
          description:
            "Montessori Nursery — early learning through practical life and sensorial materials",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "KG / Kindergarten",
          description:
            "Kindergarten — the bridge to formal schooling: reading, writing and numbers",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Primary School Class 1 & 2",
          description:
            "Primary school for children aged 5 to 7 years following a modern curriculum",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Primary School Class 3 & 4",
          description:
            "Primary school for children aged 7 to 9 years — English, Math, Science, Urdu",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Primary School Class 5 & 6",
          description:
            "Upper primary for children aged 9 to 12 years — full subject curriculum and exam preparation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Evening Coaching Academy",
          description:
            "Evening coaching Monday–Saturday, 3:30 to 7:00 PM, for children from Play Group up to Matric — open to students of any school",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Spoken English",
          description:
            "Spoken English course for school-age children — conversation and confidence building",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Computer Courses for Kids",
          description:
            "Basic computer skills: typing, MS Word, internet basics for young students",
        },
      },
    ],
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Falcons Education System",
  // Helps Google pick the site name shown above results (instead of the bare domain).
  alternateName: ["Falcons Education System Rawalpindi", "Falcons School Rawalpindi"],
  description:
    "Official website of Falcons Education System — school education from Play Group to Class 6 and evening coaching up to Matric in Rawalpindi. Admissions open for 2026.",
  publisher: { "@id": `${BASE_URL}/#organization` },
  inLanguage: "en-PK",
};

type Crumb = { name: string; path: string };

/**
 * BreadcrumbList for one page: Home, then each crumb in order (paths like
 * "/blog"). A trail describes where the page sits — never the whole nav.
 */
export function breadcrumbSchema(trail: Crumb[]) {
  const crumbs = [{ name: "Home", path: "" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.path}`,
    })),
  };
}

// Built from the same list the visible FAQ section renders, so the markup
// always matches on-page content (a Google requirement for FAQ markup).
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};
