/**
 * JSON-LD Structured Data — Falcons Education System
 * Types: Preschool + EducationalOrganization + LocalBusiness
 * Targets local search: Rawalpindi, Kamalabad Road, Sonari, Bakra Mandi
 */

const BASE_URL = 'https://falconseducationsystem.com';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Preschool', 'EducationalOrganization', 'LocalBusiness'],
  '@id': `${BASE_URL}/#organization`,
  name: 'Falcons Education System',
  alternateName: ['Falcons Montessori School', 'Falcons Education Rawalpindi'],
  description:
    'Falcons Education System is a Montessori preschool located on Kamalabad Road, Sonari, Rawalpindi, Pakistan. We provide authentic Montessori early childhood education (Nursery, Montessori Level, KG) in a prepared environment. Serving families in Sonari, Bakra Mandi, Satellite Town, Kamalabad, Sadiqabad, and surrounding areas of Rawalpindi.',
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
  areaServed: [
    { '@type': 'Place', name: 'Kamalabad Road, Rawalpindi' },
    { '@type': 'Place', name: 'Sonari, Rawalpindi' },
    { '@type': 'Place', name: 'Bakra Mandi, Rawalpindi' },
    { '@type': 'Place', name: 'Satellite Town, Rawalpindi' },
    { '@type': 'Place', name: 'Sadiqabad, Rawalpindi' },
    { '@type': 'Place', name: 'Chaklala, Rawalpindi' },
    { '@type': 'City', name: 'Rawalpindi' },
  ],
  keywords:
    'Montessori school Rawalpindi, best Montessori school Rawalpindi, Montessori preschool Rawalpindi, Montessori school Kamalabad Road, preschool near Bakra Mandi Rawalpindi, nursery school Sonari Rawalpindi, playgroup Rawalpindi, kindergarten Rawalpindi, Falcons Education System, early childhood education Rawalpindi, Montessori admission 2025 Rawalpindi',
  knowsAbout: [
    'Montessori education',
    'Early childhood education',
    'Child development',
    'Nursery education Pakistan',
    'KG education Rawalpindi',
    'Playgroup learning',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Montessori Programs',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Nursery Program',
          description: 'Montessori Nursery for children aged 2.5 to 3.5 years in Rawalpindi',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Montessori Level',
          description: 'Full Montessori curriculum for children aged 3 to 6 years in Rawalpindi',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'KG / Kindergarten',
          description: 'Kindergarten program for children aged 4 to 6 years in Rawalpindi',
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
  name: 'Falcons Education System — Montessori School Rawalpindi',
  description:
    'Official website of Falcons Education System, the Montessori preschool on Kamalabad Road, Rawalpindi. Admissions open for Nursery, Montessori Level, and KG.',
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
        text: 'Falcons Education System serves children aged 2.5 to 6 years through three programs: Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), and KG/Kindergarten (4–6 yrs) in Rawalpindi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Falcons Education System located in Rawalpindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Falcons Education System is located at Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Punjab, Pakistan 44000. We are easily accessible from Kamalabad, Sonari, Satellite Town, Sadiqabad, and surrounding areas.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are admissions open at Falcons Education System Rawalpindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Admissions are open for 2025 at Falcons Education System, Rawalpindi. We are accepting students for Montessori, Nursery, and KG programs. Seats are limited — contact us via WhatsApp, phone, or visit our campus on Kamalabad Road for a free tour.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Montessori education and why choose it in Rawalpindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Montessori education is a child-centered method developed by Dr. Maria Montessori. It uses hands-on materials and self-directed activity so children learn at their own pace. Falcons Education System brings authentic Montessori education to Rawalpindi, offering the same global standards that parents in Kamalabad Road and surrounding areas deserve.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best age to start Montessori or preschool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The ideal age to start Montessori is between 2.5 and 3 years. At this age children are in a sensitive period for language and exploration. Our Nursery program at Falcons Education System, Rawalpindi welcomes children from 2.5 years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which areas of Rawalpindi does Falcons Education System serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We primarily serve families in Kamalabad Road, Sonari, Bakra Mandi, Satellite Town, Sadiqabad, Dhok Kala Khan, Chaklala, and the wider Rawalpindi area. Our school is conveniently located on Kamalabad Road, Rawalpindi.',
      },
    },
  ],
};
