'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Phone, ArrowUpRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const faqs = [
  {
    question: 'What programs does Falcons Education System offer?',
    answer:
      "We offer a complete school education from Nursery to Class 6: Nursery (2.5–3.5 yrs), Montessori Level (3–6 yrs), KG (4–6 yrs), and Class 1 through Class 6. We also run an Evening Coaching Academy (Mon–Fri, 15:30–19:30), Saturday Coaching, and Computer Courses for kids.",
  },
  {
    question: 'Up to which class does Falcons Education System teach?',
    answer:
      'Falcons Education System provides school education from Nursery through Class 6. Our primary school follows the national curriculum — English, Urdu, Mathematics, Science, Islamic Studies, and General Knowledge — taught in small classes.',
  },
  {
    question: 'Where is Falcons Education System located in Rawalpindi?',
    answer:
      'Street No 14, Sonari Bank, Kamalabad Road, near Bakra Mandi, Rawalpindi, Pakistan 46000.',
  },
  {
    question: 'Are admissions currently open?',
    answer:
      'Yes. Admissions are open for the 2026 session — for all classes from Nursery to Class 6, Evening Coaching, Saturday Coaching, and Computer Courses. Seats are limited. Call or WhatsApp 0311-9911288, or visit the campus for a tour.',
  },
  {
    question: 'What are the school and coaching timings?',
    answer:
      'School · Monday–Friday, 08:00 – 14:00. Evening Coaching · Monday–Friday, 15:30 – 19:30. Saturday Coaching · 09:00 – 13:00. Sunday is closed.',
  },
  {
    question: 'What is the Evening Coaching Academy?',
    answer:
      'After-school coaching for children attending any school. We focus on subject understanding, exam preparation, concept-strengthening, and supervised homework completion. Mon–Fri, 15:30–19:30. Saturday sessions also available.',
  },
  {
    question: 'What computer courses do you offer for kids?',
    answer:
      'A real introduction to digital literacy — basic computer knowledge, touch typing, Microsoft Word basics, and internet fundamentals. The skills children need before they need them. Enquire on 0311-9911288 for timing details.',
  },
  {
    question: 'What is Montessori education?',
    answer:
      'A child-centered method developed by Dr. Maria Montessori. Children learn at their own pace through hands-on materials in a prepared environment — building independence, concentration, and a genuine love of learning rather than performing for praise.',
  },
  {
    question: 'What is the best age to start Montessori or preschool?',
    answer:
      'Between 2.5 and 3 years. Our Nursery program welcomes children from 2.5 years. At this age, children are in a sensitive period for language, order, and sensorial exploration.',
  },
  {
    question: 'How can I contact Falcons Education System?',
    answer:
      'Call or WhatsApp 0311-9911288. PTCL landline: 051-6129955. Or visit the campus on Kamalabad Road during school hours — walk-ins are welcome.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative bg-paper-warm/40"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <Eyebrow number="09">Common questions</Eyebrow>
            <h2
              id="faq-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              The things parents ask{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                first
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            Quick answers about programs, timings, location, and admissions. If your
            question isn&apos;t here, call us — we answer the phone.
          </p>
        </FadeIn>

        {/* Accordion */}
        <FadeIn className="border-t border-line">
          <ul role="list">
            {faqs.map((faq, index) => {
              const open = openIndex === index;
              return (
                <li key={index} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="w-full flex items-baseline justify-between gap-6 py-6 sm:py-7 text-left group"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <div className="flex items-baseline gap-5 flex-1 min-w-0">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint shrink-0 mt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="font-display text-xl sm:text-2xl text-ink group-hover:text-brand transition-colors"
                        style={{ fontVariationSettings: '"opsz" 24' }}
                      >
                        {faq.question}
                      </span>
                    </div>
                    <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full border border-line text-ink-soft group-hover:border-ink group-hover:text-ink transition-colors">
                      {open
                        ? <Minus className="h-4 w-4" strokeWidth={1.75} />
                        : <Plus  className="h-4 w-4" strokeWidth={1.75} />}
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-72 pb-7' : 'max-h-0'}`}
                  >
                    <p className="pl-12 pr-12 sm:pr-16 text-[15px] text-ink-soft leading-[1.7] max-w-3xl">
                      {faq.answer}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </FadeIn>

        {/* CTA strip */}
        <FadeIn className="mt-14 flex flex-col sm:flex-row items-baseline justify-between gap-6 border-t border-line pt-10">
          <p className="font-display text-2xl text-ink max-w-xl leading-[1.25]" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
            Have another question? Call us.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+923119911288"
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-paper px-6 py-3.5 text-[14px] font-semibold hover:bg-brand-dark transition-colors"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="font-mono tracking-tight">0311-9911288</span>
            </a>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 text-[14px] font-semibold text-ink hover:border-ink transition-colors"
            >
              Contact us
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
