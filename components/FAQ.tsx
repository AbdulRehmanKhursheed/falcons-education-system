'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What age groups does Falcons Education System serve?',
    answer:
      'Falcons Education System offers early childhood education for children aged 2.5 to 6 years, through three programs: Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), and KG/Kindergarten (4–6 yrs).',
  },
  {
    question: 'Where is Falcons Education System located in Rawalpindi?',
    answer:
      'We are located at Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Pakistan 44000. We serve families in Sonari, Satellite Town, Bakra Mandi area, and neighboring neighborhoods.',
  },
  {
    question: 'Are admissions currently open?',
    answer:
      'Yes! Admissions are open for Montessori, Nursery, and KG levels for the 2025 academic year. Seats are limited — we recommend applying early. Contact us via WhatsApp, phone, or visit our campus for a free tour.',
  },
  {
    question: 'What is the Montessori method and why is it beneficial?',
    answer:
      'Montessori education is a child-centered approach developed by Dr. Maria Montessori. It emphasizes hands-on learning, self-directed activity, and collaborative play. Children learn at their own pace using specially designed materials in a prepared environment — developing independence, concentration, and a genuine love for learning.',
  },
  {
    question: 'What are the school timings at Falcons Education System?',
    answer:
      'Our school operates Monday through Friday, 8:00 AM – 2:00 PM. For specific program timings, please contact us directly as they may vary slightly by level.',
  },
  {
    question: 'How can I schedule a campus visit or apply?',
    answer:
      'You can reach us via WhatsApp, phone, or email to schedule a free visit. You can also fill out our online inquiry form on this page and we\'ll get back to you within one school day. Walk-in visits are also welcome during school hours.',
  },
  {
    question: 'What is the best age to start Montessori or preschool?',
    answer:
      'Research shows that 2.5 to 3 years is an ideal time to start Montessori education. At this age, children are in a sensitive period for language, order, and sensorial exploration. However, children benefit from Montessori at any age between 2.5 and 6 years.',
  },
  {
    question: 'How is Falcons Education System different from regular preschools in Rawalpindi?',
    answer:
      'We follow the authentic Montessori method with purpose-built classroom materials, child-led learning, and highly trained teachers — as opposed to rote memorization or teacher-led instruction. We focus on the whole child: cognitive, social, emotional, and physical development.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-falcon-cream"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-falcon-sage font-semibold uppercase tracking-wider text-sm mb-3">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-falcon-earth text-lg">
            Quick answers to common questions from parents in Rawalpindi about our Montessori school.
          </p>
        </div>

        <div className="space-y-3" role="list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              role="listitem"
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-falcon-sand/30"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-falcon-sageDark hover:bg-falcon-cream/50 transition-colors tap-target"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-falcon-sage transition-transform duration-200 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-64' : 'max-h-0'}`}
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-falcon-earth leading-relaxed border-t border-falcon-sand/30 pt-3">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-falcon-earth/70 mb-4">
            Have more questions? We&apos;re happy to help.
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-semibold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
          >
            <span aria-hidden>💬</span>
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
