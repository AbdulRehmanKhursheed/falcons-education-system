'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn } from '@/components/ui/Motion';

const FAQS = [
  {
    question: 'What programs does Falcons Education System offer?',
    answer:
      'A complete school education from Play Group to Class 6: Montessori early years (Play Group, Nursery, KG — ages 3–6) and Class 1 through Class 6. We also run an Evening Coaching Academy (Mon–Sat, 3:30–7:00 PM) for Play Group to Matric, plus Spoken English and computer courses for kids.',
  },
  {
    question: 'Up to which class does the school teach?',
    answer:
      'Play Group through Class 6. Our primary school covers English, Urdu, Mathematics, Science, Islamic Studies, and General Knowledge — taught in small classes. The Evening Coaching Academy additionally supports students up to Matric.',
  },
  {
    question: 'Where is the school located in Rawalpindi?',
    answer:
      'Street No 14, Sonari Bank, Kamalabad Road, near Bakra Mandi, Rawalpindi, Punjab 46000.',
  },
  {
    question: 'Are admissions currently open?',
    answer:
      'Yes — admissions are open for Session 2026, for all classes from Nursery to Class 6 plus coaching and computer courses. Seats are limited. Call or WhatsApp 0311-9911288, or visit the campus for a tour.',
  },
  {
    question: 'What are the school and coaching timings?',
    answer:
      'School: Monday–Thursday & Saturday, 8:00 AM – 2:00 PM; Friday, 8:00 AM – 12:30 PM. Evening Coaching Academy: Monday–Saturday, 3:30 – 7:00 PM. Sunday closed.',
  },
  {
    question: 'What is the Evening Coaching Academy?',
    answer:
      'After-school coaching for children attending any school, from Play Group up to Matric — subject understanding, exam preparation, and supervised homework completion. Monday to Saturday, 3:30–7:00 PM. All updates are posted on our Coaching Academy page.',
  },
  {
    question: 'What computer courses do you offer for kids?',
    answer:
      'A real introduction to digital literacy: basic computer knowledge, touch typing, Microsoft Word basics, and internet fundamentals. Call 0311-9911288 for current timings.',
  },
  {
    question: 'What is Montessori education?',
    answer:
      'A child-centered method developed by Dr. Maria Montessori. Children learn at their own pace through hands-on materials in a prepared environment — building independence, concentration, and a genuine love of learning.',
  },
  {
    question: 'What is the best age to start Montessori or preschool?',
    answer:
      'Around 3 years. Our Play Group welcomes children from age 3 — a sensitive period for language, order, and sensorial exploration.',
  },
  {
    question: 'How do fees work?',
    answer:
      'Fee structures differ by program, so we share the complete written breakdown — admission fee, monthly tuition, and annual charges — at the school or on WhatsApp before admission. No surprises later.',
  },
  {
    question: 'How can I contact the school?',
    answer:
      'Call or WhatsApp 0311-9911288, PTCL 051-6129955, or visit the campus on Kamalabad Road during school hours — walk-ins are welcome.',
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[1.0625rem] font-bold text-ink">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          <Plus size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 leading-relaxed text-ink-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="bg-paper py-14 md:py-20" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <FadeIn>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.question} {...faq} index={i} />
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-10 text-center text-ink-muted">
            Something else on your mind?{' '}
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
              className="font-bold text-brand hover:text-brand-dark"
            >
              Call {SITE_CONFIG.phone}
            </a>{' '}
            — we answer the phone.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
