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
    'Falcons Education System provides quality school education and evening coaching classes in Rawalpindi. Programs include Montessori Nursery, KG, Evening Coaching Academy (3:30–7:30 PM), Saturday Coaching, and Computer Courses.',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/opengraph-image`,
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
  telephone: '+92-311-9911288',
  email: 'info@falconseducationsystem.com',
  sameAs: [
    'https://www.instagram.com/falconseducationsystem/',
    'https://www.facebook.com/falconseducationsystem/',
    'https://www.tiktok.com/@falconseducationsystem',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '14:00',
      description: 'Regular school hours',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '15:30',
      closes: '19:30',
      description: 'Evening Coaching Academy',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '13:00',
      description: 'Saturday Coaching classes',
    },
  ],
  areaServed: {
    '@type': 'City',
    name: 'Rawalpindi',
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Punjab, Pakistan' },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Programs & Courses',
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
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Evening Coaching Academy',
          description: 'Evening coaching classes Monday–Friday, 3:30 PM to 7:30 PM, for school-going children',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Saturday Coaching',
          description: 'Weekend coaching and tutoring every Saturday, 9:00 AM to 1:00 PM',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: 'Computer Courses for Kids',
          description: 'Basic computer skills: typing, MS Word, internet basics for young students',
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
    'Official website of Falcons Education System — school education and evening coaching in Rawalpindi. Admissions open for 2026.',
  publisher: { '@id': `${BASE_URL}/#organization` },
  inLanguage: 'en-PK',
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'About Us', item: `${BASE_URL}/about` },
    { '@type': 'ListItem', position: 3, name: 'Programs', item: `${BASE_URL}/programs` },
    { '@type': 'ListItem', position: 4, name: 'Admissions', item: `${BASE_URL}/admissions` },
    { '@type': 'ListItem', position: 5, name: 'Contact', item: `${BASE_URL}/contact` },
    { '@type': 'ListItem', position: 6, name: 'Blog', item: `${BASE_URL}/blog` },
    { '@type': 'ListItem', position: 7, name: 'Careers', item: `${BASE_URL}/careers` },
  ],
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What programs does Falcons Education System offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), KG (4–6 yrs), Evening Coaching Academy (3:30–7:30 PM), Saturday Coaching, and Computer Courses for kids.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Falcons Education System located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Punjab, Pakistan 44000.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are admissions open at Falcons Education System?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Admissions are open for 2026. Call or WhatsApp 0311-9911288 or PTCL 051-6129955.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the evening coaching class timings?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evening Coaching Academy: Monday–Friday, 3:30 PM to 7:30 PM. Also open on Saturdays 9:00 AM to 1:00 PM.',
      },
    },
    {
      '@type': 'Question',
      name: 'What computer courses are available for kids?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic Computer Knowledge, Typing Skills, Microsoft Word Basics, and Internet Basics. Call 0311-9911288 for timing details.',
      },
    },
  ],
};
