/**
 * JSON-LD Structured Data — Falcons Education System
 */

const BASE_URL = 'https://falconseducationsystem.com';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Preschool', 'EducationalOrganization', 'LocalBusiness'],
  '@id': `${BASE_URL}/#organization`,
  name: 'Falcons Education System',
  description:
    'Falcons Education System is a Montessori preschool in Rawalpindi, Pakistan. We provide authentic Montessori early childhood education — Nursery, Montessori Level, and KG — for children aged 2.5 to 6 years.',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/og-image.jpg`,
  foundingDate: '2024-08-01',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi',
    addressLocality: 'Rawalpindi',
    addressRegion: 'Punjab',
    postalCode: '44000',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 33.57489,
    longitude: 73.03198,
  },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Street+14+Sonari+Bank+Kamalabad+Road+Rawalpindi+Pakistan',
  telephone: '+92-XXX-XXXXXXX',
  email: 'info@falconseducationsystem.com',
  sameAs: [
    'https://www.instagram.com/falconseducationsystem/',
    'https://www.facebook.com/falconseducationsystem/',
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '14:00',
  },
  areaServed: {
    '@type': 'City',
    name: 'Rawalpindi',
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Punjab, Pakistan' },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Montessori Programs',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Nursery Program',
          description: 'Montessori Nursery for children aged 2.5 to 3.5 years',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Montessori Level',
          description: 'Full Montessori curriculum for children aged 3 to 6 years',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'KG / Kindergarten',
          description: 'Kindergarten program for children aged 4 to 6 years',
        },
      },
    ],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Falcons Education System',
  description:
    'Official website of Falcons Education System, a Montessori preschool in Rawalpindi. Admissions open for Nursery, Montessori Level, and KG.',
  publisher: { '@id': `${BASE_URL}/#organization` },
  inLanguage: 'en-PK',
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'About Us', item: `${BASE_URL}/#about` },
    { '@type': 'ListItem', position: 3, name: 'Programs', item: `${BASE_URL}/#programs` },
    { '@type': 'ListItem', position: 4, name: 'Admissions', item: `${BASE_URL}/#admissions` },
    { '@type': 'ListItem', position: 5, name: 'Contact', item: `${BASE_URL}/#contact` },
  ],
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What age groups does Falcons Education System serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We serve children aged 2.5 to 6 years through three programs: Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), and KG/Kindergarten (4–6 yrs).',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Falcons Education System located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are at Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Punjab, Pakistan 44000.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are admissions currently open?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Admissions are open for 2025. We are accepting students for Nursery, Montessori Level, and KG. Contact us via WhatsApp, phone, or visit our campus for a free tour.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Montessori education?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Montessori education is a child-centered method developed by Dr. Maria Montessori. It uses hands-on materials and self-directed activity so children learn at their own pace in a prepared environment.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best age to start Montessori?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The ideal age to start Montessori is between 2.5 and 3 years, when children are in a sensitive period for language and exploration. Our Nursery program welcomes children from 2.5 years.',
      },
    },
  ],
};
