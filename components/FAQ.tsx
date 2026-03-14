'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What programs does Falcons Education System offer?',
    answer:
      'We offer Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), KG/Kindergarten (4–6 yrs), Evening Coaching Academy (3:30–7:30 PM, Mon–Fri), Saturday Coaching (9 AM–1 PM), and Computer Courses for kids.',
  },
  {
    question: 'Where is Falcons Education System located in Rawalpindi?',
    answer:
      'We are located at Street No 14, Sonari Bank, Kamalabad Road, Near Bakra Mandi, Rawalpindi, Pakistan 44000.',
  },
  {
    question: 'Are admissions currently open?',
    answer:
      'Yes! Admissions are open for all programs for 2026 — Nursery, Montessori Level, KG, Evening Coaching, Saturday Coaching, and Computer Courses. Seats are limited. Call or WhatsApp us at 0311-9911288 or visit our campus for a free tour.',
  },
  {
    question: 'What are the school and coaching timings?',
    answer:
      'Regular school: Monday–Friday, 8:00 AM – 2:00 PM. Evening Coaching Academy: Monday–Friday, 3:30 PM – 7:30 PM. Saturday Coaching: Every Saturday, 9:00 AM – 1:00 PM.',
  },
  {
    question: 'What is the Evening Coaching Academy?',
    answer:
      'Our Evening Coaching Academy runs Monday–Friday from 3:30 PM to 7:30 PM. It helps school-going children improve their subject understanding, prepare for exams, strengthen basic concepts, and build confidence in their studies. We are also open on Saturdays.',
  },
  {
    question: 'What computer courses do you offer for kids?',
    answer:
      'We offer basic computer courses for young students covering: Basic Computer Knowledge, Typing Skills, Microsoft Word Basics, and Internet Basics. These skills help children become confident in today\'s digital world. Enquire at 0311-9911288 for timing details.',
  },
  {
    question: 'What is Montessori education?',
    answer:
      'Montessori education is a child-centered method developed by Dr. Maria Montessori. It uses hands-on materials and self-directed activity so children learn at their own pace in a prepared environment — developing independence, confidence, and a genuine love of learning.',
  },
  {
    question: 'What is the best age to start Montessori or preschool?',
    answer:
      'The ideal age to start Montessori is between 2.5 and 3 years. Our Nursery program welcomes children from 2.5 years. At this age, children are in a sensitive period for language, order, and sensorial exploration.',
  },
  {
    question: 'How can I contact Falcons Education System?',
    answer:
      'Call or WhatsApp: 0311-9911288. PTCL landline: 051-6129955. You can also visit our campus at Kamalabad Road, Rawalpindi during school hours. Walk-in visits are welcome.',
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
            Quick answers about our school, coaching classes, timings, and admissions.
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
            Have more questions? Call or WhatsApp us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+923119911288"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-semibold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
            >
              <span aria-hidden>📞</span>
              <span>0311-9911288</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-falcon-sage/30 text-falcon-sageDark rounded-xl font-semibold hover:bg-falcon-sage/5 transition-colors tap-target"
            >
              <span aria-hidden>💬</span>
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
