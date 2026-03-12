/**
 * JSON-LD Structured Data for Falcons Education System
 * Combines Preschool, EducationalOrganization, and LocalBusiness for maximum SEO
 */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Preschool', 'EducationalOrganization', 'LocalBusiness'],
  '@id': 'https://falconseducationsystem.com/#organization',
  name: 'Falcons Education System',
  alternateName: 'Falcons Montessori School',
  description:
    'Falcons Education System is a Montessori preschool in Rawalpindi, Pakistan. We offer child-centered early childhood education with prepared environments, qualified teachers, and the Montessori method. Admissions open for Nursery, KG, and Montessori levels.',
  url: 'https://falconseducationsystem.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://falconseducationsystem.com/logo.png',
    width: 512,
    height: 512,
  },
  image: 'https://falconseducationsystem.com/og-image.jpg',
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
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Punjab',
      containedInPlace: {
        '@type': 'Country',
        name: 'Pakistan',
      },
    },
  },
  keywords:
    'Montessori school Rawalpindi, best Montessori school Rawalpindi, Montessori preschool Rawalpindi, early childhood education Rawalpindi, Falcons Education System, Montessori admission open, child-centered learning, Kamalabad school, Sonari school',
  knowsAbout: ['Montessori education', 'Early childhood education', 'Child development'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://falconseducationsystem.com/#website',
  url: 'https://falconseducationsystem.com',
  name: 'Falcons Education System',
  description: 'Montessori preschool in Rawalpindi - Admissions open for Nursery, KG, and Montessori levels.',
  publisher: {
    '@id': 'https://falconseducationsystem.com/#organization',
  },
  inLanguage: 'en-PK',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://falconseducationsystem.com/?s={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://falconseducationsystem.com',
    },
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
        text: 'Falcons Education System offers Montessori education for early childhood, typically ages 2.5 to 6 years, including Nursery and KG levels.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Falcons Education System located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are located at Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Pakistan 44000.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are admissions open at Falcons Education System?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Admissions are open for Montessori, Nursery, and KG levels. Contact us via WhatsApp, phone, or visit our campus for a tour.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Montessori education?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Montessori education is a child-centered approach that emphasizes hands-on learning, self-directed activity, and collaborative play. Children learn at their own pace in a prepared environment with specially designed materials.',
      },
    },
  ],
};
