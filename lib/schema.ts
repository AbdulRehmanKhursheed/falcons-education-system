/**
 * JSON-LD Structured Data — Falcons Education System
 */

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
  areaServed: {
    "@type": "City",
    name: "Rawalpindi",
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Punjab, Pakistan",
    },
  },
  slogan: "Where curious minds take flight",
  knowsAbout: [
    "Montessori education",
    "Early childhood education",
    "Primary school education (Class 1–6)",
    "Evening coaching (Play Group to Matric)",
    "Spoken English for children",
    "Computer courses for children",
  ],
  // Parent testimonials displayed on the site (see homepage "From parents" section).
  // Note: keep these in sync with components/home/Quote.tsx.
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Uzma S." },
      inLanguage: "ur",
      reviewBody:
        "MashaAllah teachers bohat mehnat karti hain. Bachi ab ghar aa kar khud parhne baithti hai.",
      itemReviewed: {
        "@id": "https://falconseducationsystem.com/#organization",
      },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Kashif M." },
      inLanguage: "ur",
      reviewBody:
        "Pehle school ke naam se rota tha, ab subah khud uniform pehen ke tayyar hota hai.",
      itemReviewed: {
        "@id": "https://falconseducationsystem.com/#organization",
      },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Ahmad R." },
      inLanguage: "ur",
      reviewBody:
        "Staff cooperative hai, safai achi hai, aur fees bhi reasonable. Recommended.",
      itemReviewed: {
        "@id": "https://falconseducationsystem.com/#organization",
      },
    },
  ],
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
  description:
    "Official website of Falcons Education System — school education from Play Group to Class 6 and evening coaching up to Matric in Rawalpindi. Admissions open for 2026.",
  publisher: { "@id": `${BASE_URL}/#organization` },
  inLanguage: "en-PK",
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "About Us",
      item: `${BASE_URL}/about`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Programs",
      item: `${BASE_URL}/programs`,
    },
    {
      "@type": "ListItem",
      position: 8,
      name: "Coaching Academy",
      item: `${BASE_URL}/coaching`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Admissions",
      item: `${BASE_URL}/admissions`,
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Contact",
      item: `${BASE_URL}/contact`,
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Blog",
      item: `${BASE_URL}/blog`,
    },
    {
      "@type": "ListItem",
      position: 7,
      name: "Careers",
      item: `${BASE_URL}/careers`,
    },
  ],
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is a good school in Rawalpindi for young children?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For families near Kamalabad Road, Bakra Mandi, Dhoke Kashmirian and Sadiqabad in Rawalpindi, Falcons Education System is a strong option for children aged 3 to 12: Montessori early years (Play Group, Nursery, KG), primary school up to Class 6, small class sizes with individual attention, and an Evening Coaching Academy (Mon–Sat 3:30–7:00 PM) for Play Group to Matric, open to children from any school. Parents are welcome to visit the campus on any working morning before deciding.",
      },
    },
    {
      "@type": "Question",
      name: "What programs does Falcons Education System offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer Montessori early years — Play Group, Nursery and KG (ages 3–6) — Primary School Class 1 through Class 6, an Evening Coaching Academy (Mon–Sat, 3:30–7:00 PM) for Play Group to Matric, Spoken English, and Computer Courses for kids.",
      },
    },
    {
      "@type": "Question",
      name: "Up to which class does Falcons Education System teach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Falcons Education System provides school education from Play Group all the way up to Class 6. The Evening Coaching Academy additionally supports students from Play Group up to Matric, from any school.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Falcons Education System located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Punjab, Pakistan 46000.",
      },
    },
    {
      "@type": "Question",
      name: "Are admissions open at Falcons Education System?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Admissions are open for 2026. Call or WhatsApp 0311-9911288 or PTCL 051-6129955.",
      },
    },
    {
      "@type": "Question",
      name: "What are the evening coaching class timings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evening Coaching Academy: Monday to Saturday, 3:30 PM to 7:00 PM — for children from Play Group up to Matric, from any school. Sunday closed.",
      },
    },
    {
      "@type": "Question",
      name: "What computer courses are available for kids?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Basic Computer Knowledge, Typing Skills, Microsoft Word Basics, and Internet Basics. Call 0311-9911288 for timing details.",
      },
    },
  ],
};
